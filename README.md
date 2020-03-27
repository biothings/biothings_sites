# BioThings & API Web Apps

Learn how to add/setup/make changes to web apps in just a few steps.

## How the API apps work (api-theme)

The API template depends on one thing: the variable **site_name** passed through the site.config file.

Each VueJS component conditionally renders specific content based on this variable.

For each new API you need to provide:
1. A stylesheet named <**site_name**>.css (you can copy mygene.css as a template)
2. A folder in static/css/ named <**site_name**> containing all icons. Please use this [link](https://realfavicongenerator.net/) to create new sets. ( Do not rename the icons)
3. API specific data (see other examples under the **mounted** lifecycle code in index.html)

## How BioThings app works (bt-theme)

The BT template is independent and unique, any changes can be made directly on any part of the code.


API and BT templates are served extending the use of the the Wulab.io server.

# Uptime DB

## Setup

1. Install [Redis](https://redis.io/topics/quickstart) and run globally or within scope of server

2. Run Redis Server
```bash
cd redis-5.0.7
src/redis-server
```

3. Confirm installation:

   src/redis-cli then type PING (>> PONG) to confirm Redis is running

4. Install and start web app server
```bash
pip install -r requirements.txt
python index.py --debug
```

## Uptime API

Get Uptime for a particular API at any given date. Eg  01302020mygene.info

/date-status/<**MMDDYYYY+site_name**>
