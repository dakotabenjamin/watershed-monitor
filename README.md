watershed-monitor
=================

This is a Drupal 7.22 installation with a PostgreSQL database. If you try to fork this it will not work because you need to run an initialization script for creating the secondary database (which I haven't written). Plus I have no idea what I'm doing with Git, so bear with me.

However you can submit bug requests and look through the code.

Shoot me an email at dmb2 [at] clevelandmetroparks dot com

Installation:
You need Apache 2, and postgresql. Set up the postgres with user postgres and make another user named drupal (like in the intallation instructions on drupal. Clone the repo into a directory like /var/www/ or the like where it can be accessed via http. Run the install script? You might have to, I haven't tested this off of the production server yet.

For the postgresql database, the drupal installation should have figured its stuff out. For the monitoring database, you need to create the postgres database with user postgres, then run the following script:

[script] 

