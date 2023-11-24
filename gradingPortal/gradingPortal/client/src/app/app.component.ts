// import { DOCUMENT } from '@angular/common';
import { DOCUMENT } from '@angular/common';
import { Component, HostListener, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { GradingService } from './grading.service';
import { faCoffee, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(private router: Router, @Inject(DOCUMENT) document, private GradingService: GradingService) {
  }
  faSignOutAlt = faSignOutAlt;
  isUser: boolean;
 
  showLogin: boolean;
  data: any = {
    userName: "",
    pwd: "",
    email: "",
    role: "",
    roles: ['pupil', 'teacher', 'admin']
  }
  showRegister: boolean;
  errorMsg: boolean;
  userMsg: boolean;
  isAdmin: boolean;
  isPupil: boolean;
  isTeacher: boolean;
  ngOnInit() {
    setTimeout(() => {
      if (Boolean(sessionStorage.getItem('isLoggedIn'))) {
        this.showLogin = false;
        let userRole = sessionStorage.getItem('loggedInUserRole');
        if (userRole == "pupil") {
          this.router.navigate(['/pupil']);
        } else if (userRole == "admin") {
          this.router.navigate(['/admin']);
        } else if (userRole == "teacher") {
          this.router.navigate(['/teacher']);
        }
      } else {
        console.log("cvbnm")
        this.showLogin = true;
      }
    },500)
  }

  login() {
    let user;
    sessionStorage.clear();
    this.GradingService.checkIfUserExists(this.data.userName, this.data.pwd)
      .subscribe(data => {
        console.log("user login", data)
        user = data;
      });
    setTimeout(() => {
      console.log("customer : ", user);
      if (user) {
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('loggedInUser', this.data.userName);
        sessionStorage.setItem('id', user);
        this.GradingService.getUser({ "id": user, "pwd": this.data.pwd }).subscribe(res => {
          console.log("res",res)
          if(!res){
            this.showLogin = false;
          } else {
            this.showLogin = true;
            sessionStorage.setItem('loggedInUserRole', res[0].role)
          }
        })
        this.showLogin = false;
        this.ngOnInit();
      } else {
        this.errorMsg = true;
      }
    }, 3000)
  }

  logOut() {
    sessionStorage.clear();
    this.router.navigate([""]);
    this.showLogin = true;
  }

  register() {
    let params = {
      username: this.data.userName,
      forename: this.data.foreName,
      surname: this.data.surName,
      pwd: this.data.pwd,
      role: this.data.role ? this.data.role : this.data.roles[this.data.roles.length-1]
    }
    this.GradingService.addUser(params)
      .subscribe(order => {
        this.userMsg = true;
      });
  }

  goToLogin() {
    this.data = {
      userName: '',
      email: '',
      password: '',
      roles: ['pupil', 'teacher', 'admin']
    }
    this.showLogin = true;
    this.showRegister = false;
  }

  showAdminView() {
    console.log('admin view')
    this.router.navigate(['/admin']);
  }

  showPupilView() {
    console.log('pupil view')
    this.router.navigate(['/pupil']);
  }

  showTeacherView() {
    this.router.navigate(['/teacher']);
  }

  onChangeRole(event) {
    console.log("changed role", event.target.value)
    this.data.role = event.target.value;
  }

}
