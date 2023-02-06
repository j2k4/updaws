const exec = require("child_process").exec;
const fs = require("fs");
const readline = require("readline");

// if nothing in the existing config file, use these defaults
let _region = "us-east-2";
let _output = "text";
const configPath = `${process.env.HOME}/.aws/config`;

const args = process.argv.slice(2);
let _profile = 'default'
if (args.length && new RegExp(/\w+/).test(args[0])) {
    _profile = args[0];
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const validateCredentials = (credentials) => {
    const lines = credentials.split("\n");

    // ignore the first line, usually something line "[SSO_Profile_Name]"
    // we don't care about the profile name
    lines.shift()

    if (lines.length < 3) {
        console.error("Error: Invalid credentials structure.");
        return false;
    }

    const accessKeyLine = lines[0];
    const secretKeyLine = lines[1];
    const sessionTokenLine = lines[2];

    if (!accessKeyLine.startsWith("aws_access_key_id=") ||
        !secretKeyLine.startsWith("aws_secret_access_key=") ||
        !sessionTokenLine.startsWith("aws_session_token=")) {
        console.error("Error: Invalid credentials structure found in clipboard.");
        return false;
    }

    console.log("Valid credentials structure found in clipboard.");
    return true;
};

const readExistingConfig = () => {
    try {
        config = fs.readFileSync(configPath, "utf-8");
    } catch (err) {
        console.error(`Error reading config file: ${err}`);
        return;
    }

    const lines = config.split("\n");
    let inDefaultSection = false;
    var region, output;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line === "[default]") {
            inDefaultSection = true;
        } else if (line.startsWith("[") && line.endsWith("]")) {
            inDefaultSection = false;
        } else if (inDefaultSection) {
            if (line.startsWith("_region")) {
                region = line.split("=")[1].trim();
            } else if (line.startsWith("_output")) {
                output = line.split("=")[1].trim();
            }
        }
    }

    _region = region ? region : _region;
    _output = output ? output : _output;
}


const updateAWSConfigNamedProfile = (credentials, profileName) => {
    const lines = credentials.split('\n');
    lines.shift(); // ignore the first line
    const accessKeyLine = lines[0];
    const secretKeyLine = lines[1];
    const sessionTokenLine = lines[2];
   
    const existingConfig = fs.readFileSync(configPath, 'utf-8');
    let config =  existingConfig;
    config += `\n[${profileName}]\nregion = ${_region}\noutput = ${_output}\n${accessKeyLine}\n${secretKeyLine}\n${sessionTokenLine}`;
  
    try {
      fs.writeFileSync(configPath, config, 'utf-8');
      console.log(`${configPath} file successfully updated.`);
    } catch (error) {
      console.error(`Error writing updated AWS config: ${error}`);
    }
  };

const updateAWSConfigDefaultProfile = (credentials) => {
    const lines = credentials.split('\n');
    lines.shift(); // ignore the first line
    const accessKeyLine = lines[0];
    const secretKeyLine = lines[1];
    const sessionTokenLine = lines[2];
  
    let config = '';
    let foundDefaultSection = false;
    let inDefaultSection = false;
  
    try {
      const existingConfig = fs.readFileSync(configPath, 'utf-8');
      const existingLines = existingConfig.split('\n');
      existingLines.forEach((line) => {
        if (line.startsWith('[default]')) {
          foundDefaultSection = true;
          inDefaultSection = true;
          config += `[default]\nregion = ${_region}\noutput = ${_output}\n${accessKeyLine}\n${secretKeyLine}\n${sessionTokenLine}\n\n`;
        } 
        else if (inDefaultSection) {
            if (line.startsWith('[')) {
                inDefaultSection = false;
                config += line + '\n';
            }
        }
        else {
          config += line + '\n';
        }
      });
    } catch (error) {
      console.error(`Error reading existing AWS config: ${error}`);
      return;
    }
  
    if (!foundDefaultSection) {
      config += `[default]\nregion = ${_region}\noutput = ${_output}\n${accessKeyLine}\n${secretKeyLine}\n${sessionTokenLine}\n`;
    }
  
    try {
      fs.writeFileSync(configPath, config, 'utf-8');
      console.log(`${configPath} file successfully updated.`);
    } catch (error) {
      console.error(`Error writing updated AWS config: ${error}`);
    }
  };

exec("pbpaste", (error, stdout, stderr) => {
    if (error) {
        console.error(`Error executing pbpaste process: ${error}`);
        return;
    }

    const credentials = stdout.toString();


    if (!validateCredentials(credentials)) {
        console.log('Exiting program. No files were modified.');
        process.exit(1);
    }

    readExistingConfig();

    // ok to update the file now, but will still ask the user to confirm

    rl.question(`Do you want to write the config to ${configPath} (y/n)? `, answer => {
        if (answer === "y") {
            _profile == 'default' ? 
            updateAWSConfigDefaultProfile(credentials) : 
            updateAWSConfigNamedProfile(credentials, _profile);
        } else {
          console.log("Exiting program.");
        }
        rl.close();
      });
});