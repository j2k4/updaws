## updaws

This simple package is made for updating the AWS CLI credentials in the `~/.aws/config` file on macOS by reading from stdin. 

`updaws` expects that the contents of the clipboard be in the following format:

```
[SSO_Profile_Name]
aws_access_key_id=ASIA6GGZZ5SSAMPSES
aws_secret_access_key=78LR3IUSAMPLE9vnw+tYLCOOVjhwKYc2pBpV
aws_session_token=IQoJb3JpZ2luX2SAMPLEkHwdKmrgA
```

If `updaws` does not find the `aws_access_key_id`, `aws_secret_access_key`, or `aws_session_token` in your clipboard, it will not update your `~/.aws/config` file.

`updaws` is for people who have multiple AWS SSO profiles and want to easily update their credentials in the `~/.aws/config` file. Maybe `aws sso login` doesn't work for you, or you just want to update your credentials without having to open the AWS CLI. You probably see a screen something like this one, and Option 1 doesn't work for you, either.

![AWS SSO Login Screen](https://raw.githubusercontent.com/j2k4/updaws/main/images/sso-credentials-1.png)

`updaws` is for Option 2 people. Click on option 2, and you'll see a screen like this one.

![AWS SSO Login Screen](https://raw.githubusercontent.com/j2k4/updaws/main/images/sso-credentials-2.png)

Click to copy the contents of the screen to your clipboard then run `updaws` in your terminal. It will update your `~/.aws/config` file with the new credentials.

### Go Team Option 2!