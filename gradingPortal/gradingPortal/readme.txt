#############################################################################################################################
This document explains all the steps to be followed in sequence to run the application - Student Grading Portal
#############################################################################################################################
Prerequisites- install npm globally using "npm install npm@latest -g" command and Angular CLI using "npm install -g @angular/cli",
MySQL(PhpMyAdmin) Database

1.Application has been developed with the following technologies: 
Angular 11,HTML5,CSS,Typescript - Client side 
NodeJS - Server side
PhpMyAdmin Interface used to create MySQL Database. 

2.Within the "gradingPortal" folder,two folders named "client" and "server" are present. 

3.Inside the server folder, the server side code is present.To run the server, open the server folder 
in Visual Studio Code and run the following commands in the terminal:
	npm i
	node index.js
Now, the server is running in localhost:3000 in your machine

4.Inside the client folder,client code is present.To run the client, open the client folder
 in Visual Studio Code and run the following commands in the terminal:
	npm i
	npm start
Now, the client is up in localhost:4200 by default

5.Run the scripts in script file to create all the tables, procedures and functions required by the application to be available in the Database.

6.The client now fetches the data from the MySQL Database by connecting to the server running in the localhost:3000 port.

7.The Student Grading Portal application is now up and running in your machine!

8.For the data setup, there are some admin, pupil and teachers created and their passwords are hashed.
So, to login please use the following credential:

Admin - username: admin1, password: admin1
Admin - username: admin2, password: admin2
Pupil - username: pupil1, password: pupil1
Pupil - username: pupil2, password: pupil2
Pupil - username: pupil3, password: pupil3
Pupil - username: pupil4, password: pupil4
Pupil - username: pupil5, password: pupil5
Pupil - username: pupil6, password: pupil6
Pupil - username: pupil7, password: pupil7
Pupil - username: pupil8, password: pupil8
Pupil - username: pupil9, password: pupil9
Teacher - username: teacher1, password: teacher1
Teacher - username: teacher2, password: teacher2
###############################################################################################################################
