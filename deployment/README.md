# Deployment Scip for Asset Buster Application
## Web deployment
- For web deployment run ./001-copy_to_server in your bash terminal in deployment directort
- you can deploy from local and gitHub 
- Don't track the export-env.sh. This file contains sensity information
- export-env.sh contains the variables that control the mode of the deployment
- The deployment takes care of all the valid application for the deployment except for the Redis which should be written as a separate depoyment
# Pg deploment
- run ./01-install_pg.sh. it will deply the pg on the server

# Note
- the deployment is specific to uBuntu machine

# Troubleshhoting
```bash
 # use to check the status and log of the backemnd application called the server
 sudo systemctl status asset-buster-app-backend
 sudo journalctl -u  asset-buster-app-backend

# To view the caddy config file 
curl -s http://localhost:2019/config/ | jq
```