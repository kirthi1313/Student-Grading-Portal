import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
// import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { Class, Subject, Test, User } from './grading';
import { MessageService } from './message.service';


@Injectable({ providedIn: 'root' })
export class GradingService {

  private heroesUrl = 'api/heroes';  // URL to web api
  private serverUrl = 'http://localhost:3000';


  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient,
    private messageService: MessageService) { }

  // users
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.serverUrl + "/users")
      .pipe(
        tap(_ => this.log('fetched users')),
        catchError(this.handleError<User[]>('getUsers', []))
      );
  }

  getUser(user): Observable<User> {
    return this.http.get<User>(this.serverUrl + "/user", {
      params: {
        id: user.id,
        currentPwd: user.pwd 
      }
    })
      .pipe(
        tap(_ => this.log('fetched user')),
        catchError(this.handleError<User>('getUser'))
      );
  }

  getAllClassDetails(): Observable<any> {
    return this.http.get<any>(this.serverUrl + "/getAllClassDetails")
      .pipe(
        tap(_ => this.log('fetched classes')),
        catchError(this.handleError<any>('getAllClassDetails'))
      );
  }

  getPupilTestResultById(id): Observable<any> {
    return this.http.get<any>(this.serverUrl + "/getPupilTestResultById", {
      params: {
        id: id
      }
    })
      .pipe(
        tap(_ => this.log('fetched Pupil')),
        catchError(this.handleError<any>('getPupilTestResultById'))
      );
  }

  getPupilTestResultBySubject(pupilId,subjectId): Observable<any> {
    return this.http.get<any>(this.serverUrl + "/getPupilTestResultBySubject", {
      params: {
        pupilId: pupilId,
        subjectId: subjectId
      }
    })
      .pipe(
        tap(_ => this.log('fetched Pupil')),
        catchError(this.handleError<any>('getPupilTestResultBySubject'))
      );
  }

  getSubjectsByTeacherId(teacherId): Observable<any> {
    return this.http.get<any>(this.serverUrl + "/getSubjectsByTeacherId", {
      params: {
        teacherId: teacherId
      }
    })
      .pipe(
        tap(_ => this.log('fetched subjects')),
        catchError(this.handleError<any>('getSubjectsByTeacherId'))
      );
  }

  getMessages(userId): Observable<any> {
    return this.http.get<any>(this.serverUrl + "/getMessages", {
      params: {
        id: userId
      }
    })
      .pipe(
        tap(_ => this.log('fetched subjects')),
        catchError(this.handleError<any>('getMessages'))
      );
  }


  checkIfUserExists(userName, pwd): Observable<any> {
    return this.http.get<any>(this.serverUrl + "/checkUser", {
      params: {
        userName: userName,
        pwd: pwd
      }
    })
      .pipe(
        tap(_ => this.log('fetched user')),
        catchError(this.handleError<any>('checkIfUserExists', ''))
      );
  }

  addUser(data): Observable<User> {
    let url = '/createUser'
    return this.http.post<User>(this.serverUrl + url, data, this.httpOptions).pipe(
      tap((newUser: any) => this.log(`added user w/ id=${newUser}`)),
      catchError(this.handleError<User>('addUser'))
    );
  }

  createMessage(data): Observable<any> {
    let url = '/createMessage'
    return this.http.post<any>(this.serverUrl + url, data, this.httpOptions).pipe(
      tap((newUser: any) => this.log(`added msg w/ id=${newUser}`)),
      catchError(this.handleError<any>('createMessage'))
    );
  }

  markMessageAsRead(data): Observable<any> {
    let url = '/markMessageAsRead'
    return this.http.post<any>(this.serverUrl + url, data, this.httpOptions).pipe(
      tap((newUser: any) => this.log(`added msg w/ id=${newUser}`)),
      catchError(this.handleError<any>('markMessageAsRead'))
    );
  }

  getMessageUsersForPupil(userId): Observable<any> {
    return this.http.get<any>(this.serverUrl + "/getMessageUsersForPupil", {
      params: {
        id: userId
      }
    })
      .pipe(
        tap(_ => this.log('fetched getMessageUsersForPupil')),
        catchError(this.handleError<any>('getMessageUsersForPupil'))
      );
  }

  getMessageUsersForTeacher(userId): Observable<any> {
    return this.http.get<any>(this.serverUrl + "/getMessageUsersForTeacher", {
      params: {
        id: userId
      }
    })
      .pipe(
        tap(_ => this.log('fetched getMessageUsersForTeacher')),
        catchError(this.handleError<any>('getMessageUsersForTeacher'))
      );
  }

  editUser(data): Observable<User> {
    let url = '/editUser'
    return this.http.post<User>(this.serverUrl + url, data, this.httpOptions).pipe(
      tap((editUser: any) => this.log(`edited user w/ id=${editUser}`)),
      catchError(this.handleError<User>('editUser'))
    );
  }

  editTestResultById(data): Observable<any> {
    let url = '/editTestResultByPupilId'
    return this.http.post<any>(this.serverUrl + url, data, this.httpOptions).pipe(
      tap((editTestResultByPupilId: any) => this.log(`edited user w/ id=${editTestResultByPupilId}`)),
      catchError(this.handleError<any>('editTestResultByPupilId'))
    );
  }
  // classes
  getClasses(): Observable<Class[]> {
    return this.http.get<Class[]>(this.serverUrl + "/classes")
      .pipe(
        tap(_ => this.log('fetched users')),
        catchError(this.handleError<Class[]>('getClasses', []))
      );
  }

  addClass(data): Observable<Class> {
    let url = '/createClass'
    return this.http.post<Class>(this.serverUrl + url, data, this.httpOptions).pipe(
      tap((newClass: any) => this.log(`added class w/ id=${newClass}`)),
      catchError(this.handleError<Class>('addClass'))
    );
  }

  editClass(data): Observable<Class> {
    let url = '/editClass'
    return this.http.post<Class>(this.serverUrl + url, data, this.httpOptions).pipe(
      tap((editClass: any) => this.log(`edited class w/ id=${editClass}`)),
      catchError(this.handleError<Class>('editClass'))
    );
  }
  //  subjects
  getSubjectsWithClassId(classsId): Observable<Subject[]> {
    console.log("classsId", classsId)
    return this.http.get<Subject[]>(this.serverUrl + "/getSubjectsWithClassId", {
      params: {
        id: classsId
      }
    })
      .pipe(
        tap(_ => this.log('fetched subjects')),
        catchError(this.handleError<Subject[]>('getSubjectsWithClassId', []))
      );
  }

  getTestResultById(id): Observable<any[]> {
    console.log("id", id)
    return this.http.get<any[]>(this.serverUrl + "/getTestResultById", {
      params: {
        id: id
      }
    })
      .pipe(
        tap(_ => this.log('fetched ids')),
        catchError(this.handleError<any[]>('getTestResultById', []))
      );
  }

  getPupilInClass(classsId): Observable<User[]> {
    console.log("classsId", classsId)
    return this.http.get<User[]>(this.serverUrl + "/getPupilInClass", {
      params: {
        id: classsId
      }
    })
      .pipe(
        tap(_ => this.log('fetched pupil')),
        catchError(this.handleError<User[]>('getPupilInClass', []))
      );
  }

  addSubject(data): Observable<Subject> {
    let url = '/createSubject'
    return this.http.post<Subject>(this.serverUrl + url, data, this.httpOptions).pipe(
      tap((createSubject: any) => this.log(`added subject w/ id=${createSubject}`)),
      catchError(this.handleError<Subject>('addSubject'))
    );
  }

  editSubject(data): Observable<Subject> {
    let url = '/editSubject'
    return this.http.post<Subject>(this.serverUrl + url, data, this.httpOptions).pipe(
      tap((editSubject: any) => this.log(`edited subject w/ id=${editSubject}`)),
      catchError(this.handleError<Subject>('editSubject'))
    );
  }

  // pupil
  getPupilWithClassId(classsId): Observable<User[]> {
    console.log("classsId", classsId)
    return this.http.get<User[]>(this.serverUrl + "/getPupilWithClassId", {
      params: {
        id: classsId
      }
    })
      .pipe(
        tap(_ => this.log('fetched pupil')),
        catchError(this.handleError<User[]>('getPupilWithClassId', []))
      );
  }

  getPupilWithSubjectId(classsId): Observable<User[]> {
    console.log("classsId", classsId)
    return this.http.get<User[]>(this.serverUrl + "/getPupilWithSubjectId", {
      params: {
        id: classsId
      }
    })
      .pipe(
        tap(_ => this.log('fetched pupil')),
        catchError(this.handleError<User[]>('getPupilWithSubjectId', []))
      );
  }

  assignPupil(data): Observable<any> {
    let url = '/assignPupil'
    return this.http.post<any>(this.serverUrl + url, data, this.httpOptions).pipe(
      tap((assignPupil: any) => this.log(`assign Pupil w/ id=${assignPupil}`)),
      catchError(this.handleError<any>('assignPupil'))
    );
  }

  assignPupilClass(data): Observable<any> {
    let url = '/assignPupilClass'
    return this.http.post<any>(this.serverUrl + url, data, this.httpOptions).pipe(
      tap((assignPupil: any) => this.log(`assign Pupil w/ id=${assignPupil}`)),
      catchError(this.handleError<any>('assignPupil'))
    );
  }

  deassignPupil(data): Observable<any> {
    let url = '/deassignPupil'
    return this.http.post<any>(this.serverUrl + url, data, this.httpOptions).pipe(
      tap((deassignPupil: any) => this.log(`deassign Pupil w/ id=${deassignPupil}`)),
      catchError(this.handleError<any>('deassignPupil'))
    );
  }

  deassignPupilClass(data): Observable<any> {
    let url = '/deassignPupilClass'
    return this.http.post<any>(this.serverUrl + url, data, this.httpOptions).pipe(
      tap((deassignPupil: any) => this.log(`deassign Pupil w/ id=${deassignPupil}`)),
      catchError(this.handleError<any>('deassignPupil'))
    );
  }

  getTestsWithSubjectId(id): Observable<User[]> {
    console.log("classsId", id)
    return this.http.get<User[]>(this.serverUrl + "/getTestsWithSubjectId", {
      params: {
        id: id
      }
    })
      .pipe(
        tap(_ => this.log('fetched tests')),
        catchError(this.handleError<User[]>('getTestsWithSubjectId', []))
      );
  }
 
  // test
  addTest(data): Observable<Test> {
    let url = '/createTest'
    return this.http.post<Test>(this.serverUrl + url, data, this.httpOptions).pipe(
      tap((createTest: any) => this.log(`create Test w/ id=${createTest}`)),
      catchError(this.handleError<Test>('createTest'))
    );
  }

  editTest(data): Observable<Test> {
    let url = '/editTest'
    return this.http.post<Test>(this.serverUrl + url, data, this.httpOptions).pipe(
      tap((editTest: any) => this.log(`edit Test w/ id=${editTest}`)),
      catchError(this.handleError<Test>('editTest'))
    );
  }

  // teacher
  getTeachers(): Observable<User[]> {
    return this.http.get<User[]>(this.serverUrl + "/getTeachers")
      .pipe(
        tap(_ => this.log('fetched teachers')),
        catchError(this.handleError<User[]>('getTeachers', []))
      );
  }

  archiveSubject(data): Observable<any> {
    let url = '/archiveSubject'
    console.log("::::",data)
    return this.http.post<any>(this.serverUrl + url, data, this.httpOptions).pipe(
      tap((archiveSubject: any) => console.log(`archive Subjectt w/ id=${archiveSubject}`)),
      catchError(this.handleError<any>('archiveSubject'))
    );
  }

  // testresult
  addTestResult(data): Observable<any> {
    let url = '/createTestResult'
    return this.http.post<any>(this.serverUrl + url, data, this.httpOptions).pipe(
      tap((createTest: any) => this.log(`create Test w/ id=${createTest}`)),
      catchError(this.handleError<any>('createTest'))
    );
  }

  deleteTestResult(pId,tId): Observable<any> {
    let url = '/deleteTestResult'
    let data = {pupilId:pId,testId:tId};
    return this.http.post<any>(this.serverUrl + url, data, this.httpOptions).pipe(
      tap((deleteTestResult: any) => this.log(`create Test w/ id=${deleteTestResult}`)),
      catchError(this.handleError<any>('deleteTestResult'))
    );
  }

  deleteTestAndResult(tId): Observable<any> {
    let url = '/deleteTestAndResult'
    let data = tId;
    return this.http.post<any>(this.serverUrl + url, data, this.httpOptions).pipe(
      tap((deleteTestAndResult: any) => this.log(`create Test w/ id=${deleteTestAndResult}`)),
      catchError(this.handleError<any>('deleteTestAndResult'))
    );
  }



  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  /** Log a GradingService message with the MessageService */
  private log(message: string) {
    this.messageService.add(`GradingService: ${message}`);
  }
}
