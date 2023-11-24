import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { faTrashAlt, faEdit, faPlusSquare, faCommentAlt } from '@fortawesome/free-solid-svg-icons';
import { NgxCsvParser, NgxCSVParserError } from 'ngx-csv-parser';
import { Class, Subject, User } from '../grading';
// import { saveAs } from 'file-saver/FileSaver';
import { GradingService } from '../grading.service';
import { addMessageDialog } from '../pupil/pupil.component';

@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
    constructor(public GradingService: GradingService, private cd: ChangeDetectorRef,
        public dialog: MatDialog, public snackBar: MatSnackBar,
        private ngxCsvParser: NgxCsvParser) { }
    @ViewChild('fileImportInput', { static: false }) fileImportInput: any;
    isUsersView: boolean; isClassView: boolean; showTestDetails: boolean;
    dataSource: any[] = [];
    displayedColumns: string[];
    users: User[]; classes: Class[]; subjects: Subject[]; pupil: User[];testResult:any[];
    displayedColumnsMsg: string[];
    dataSourceMsg: any[] = [];

    faTrashAlt = faTrashAlt;
    faEdit = faEdit;
    faPlusSquare = faPlusSquare;
    faCommentAlt = faCommentAlt;
    
    csvRecords: any[] = [];
    header = true;
    isMessageView: boolean = false;
    unreadMsgCt: number = 0;

    ngOnInit() {
        console.log("in admin")
        this.showUserView();
    }

    getAllUsers() {
        this.dataSource = [];
        this.displayedColumns = ["id", "forename", 'surname', 'username', 'pwd', 'role', 'actions'];
        this.GradingService.getUsers()
            .subscribe(users => {
                console.log("users", users)
                this.users = users;
            });
        setTimeout(() => {
            this.dataSource = [...this.users];
            console.log("dataSource", this.dataSource)
            this.cd.detectChanges();
        }, 1000);
    }

    downloadAllSets(){
        let csvArray;
        if(this.isUsersView) {
         csvArray = this.downloadFile(this.users)
        } else {
            this.GradingService.getAllClassDetails().subscribe(resp=>{
                console.log(resp);
                csvArray = this.downloadFile(resp);
            })
        }
        setTimeout(()=>{
        const a = document.createElement('a');
        const blob = new Blob([csvArray], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
      
        a.href = url;
        a.download = 'adminViewFile.csv';
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    },1000)

    }

      downloadFile(data) {
        // let data = this.users;
        const replacer = (key, value) => (value === null ? '' : value); // specify how you want to handle null values here
        const header = Object.keys(data[0]);
        const csv = data.map((row) =>
          header
            .map((fieldName) => JSON.stringify(row[fieldName], replacer))
            .join(',')
        );
        csv.unshift(header.join(','));
        const csvArray = csv.join('\r\n');
        return csvArray;
      }

    getSubjectsWithClassId(val) {
        this.GradingService.getSubjectsWithClassId(val.id)
            .subscribe(subjects => {
                console.log("subjects", subjects)
                this.subjects = subjects;
            });
    }

    getPupilWithClassId(val) {
        this.GradingService.getPupilWithClassId(val.id)
            .subscribe(pupil => {
                console.log("pupil", pupil)
                this.pupil = pupil;
            });
    }

    getPupilWithSubjectId(val) {
        console.log(val.id)
        this.GradingService.getPupilWithSubjectId(val.id)
            .subscribe(p => {
                console.log("pupil", p)
                this.subjects.map((s) => {
                    if (s.id == val.id) {
                        s["pupil"] = p
                    }
                })
            });
    }

    getTestsWithSubjectId(val) {
        console.log(val.id)
        this.GradingService.getTestsWithSubjectId(val.id)
            .subscribe(t => {
                console.log("test", t)
                this.subjects.map((s) => {
                    if (s.id == val.id) {
                        s["tests"] = t
                    }
                })
            });
    }

    getAllClasses() {
        this.dataSource = [];
        this.displayedColumns = ["id", "name", "actions"];
        this.GradingService.getClasses()
            .subscribe(classes => {
                console.log("classes", classes)
                this.classes = classes;
            });
        setTimeout(() => {
            this.dataSource = [...this.classes];
            console.log("dataSource", this.dataSource)
            this.cd.detectChanges();
        }, 1000);
    }

    showUserView() {
        this.isUsersView = true;
        this.isClassView = false;
        this.getAllUsers();
    }

    showClassView() {
        this.testResult = [];
        this.isClassView = true;
        this.isUsersView = false;
        this.getAllClasses();
    }

    addUserView(text, val?) {
        if (val) {
            val["isEditOrDel"] = text
        }
        const dialogRef = this.dialog.open(addUserDialog, {
            width: '250px',
            data: val
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed', result);
            this.showUserView();
        });
    }

    addClassView(text, val?) {
        console.log(text, val)
        if (val) {
            val["isEditOrDel"] = text
        }
        const dialogRef = this.dialog.open(addClassDialog, {
            width: '250px',
            data: val
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed', result);
            this.showClassView();
        });
    }

    addSubjectView(text, val?) {
        console.log("val", val)
        if (val) {
            val["isEditOrDel"] = text
        }
        if (val["isEditOrDel"] == '') {
            delete val["name"]
            delete val["teacherId"]
        }
        console.log("val", val)
        const dialogRef = this.dialog.open(addSubjectDialog, {
            width: '250px',
            data: val
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed', result);
            this.showClassView();
        });
    }

    assignPupilClassView(value) {
        let ids = [];
        this.GradingService.getPupilInClass(value.id)
            .subscribe(pupil => {
                console.log("pupil11", pupil)
                pupil.map((id) => ids.push(id["pupilId"]))
                console.log(ids)
                value.pupilList = this.users.filter(user => (user.role == "pupil" && !ids.includes(user.id)))
                console.log("val", value)
                const dialogRef = this.dialog.open(assignPupilClassDialog, {
                    width: '250px',
                    data: value
                });

                dialogRef.afterClosed().subscribe(result => {
                    console.log('The dialog was closed', result);
                    this.showClassView();
                });
            });
    }

    archiveSubject(val){
        console.log("val",val);
        this.GradingService.archiveSubject({"id":val.id}).subscribe(resp=>
            {
                console.log("resp",resp);
                this.showClassView();
            })
    }


    onOpenPanel(value) {
        this.getSubjectsWithClassId(value);
        this.getPupilWithClassId(value);
        this.showTestDetails = false;
    }

    addMessage() {
        const id = sessionStorage.getItem("id");
        setTimeout(()=>{
            const dialogRef = this.dialog.open(addMessageDialog, {
                width: '250px',
                data: {"id":id,"userId":id, "receivers": this.users}
            });
    
            dialogRef.afterClosed().subscribe(result => {
                console.log('The dialog was closed', result);
            });
        },1000)
        
    }

    showMessages() {
        this.isMessageView = true;
        this.getAllMessages();
        this.displayedColumnsMsg = ["from", "dateSent", "message", "read"];
    }

    getAllMessages(){
        let id = sessionStorage.getItem("id");
        this.GradingService.getMessages(id).subscribe(resp=>{
            console.log("resp",resp);
            this.dataSourceMsg = resp;
            this.unreadMsgCt = resp.filter(x=>x.isRead==0).length;
        })
    }

    showEnrolledPupil(value) {
        console.log("value", value);
        this.getPupilWithSubjectId(value);
        this.getTestsWithSubjectId(value);
    }

    assignPupil(classData: any, value: any) {
        let pupilList;
        this.GradingService.getPupilInClass(classData.id)
            .subscribe(pupil => {
                console.log("pupil11", pupil)
                pupilList = pupil;
            });

        setTimeout(() => {
            value.pupilList = pupilList;
            console.log("value", value, classData);

            const dialogRef = this.dialog.open(assignPupilDialog, {
                width: '250px',
                data: value
            });

            dialogRef.afterClosed().subscribe(result => {
                console.log('The dialog was closed', result);
                if (result == "success") {
                    this.snackBar.open('Assigned Pupil Successfully', 'Close', {
                        horizontalPosition: 'start',
                        verticalPosition: 'bottom',
                    });
                }

                this.showClassView();
            });
        }, 1000)
    }

    deassignPupil(pupilId, subjectId) {
        this.GradingService.deassignPupil({ "pupilId": pupilId, "subjectId": subjectId })
            .subscribe(pupil => {
                this.getAllClasses();
                this.snackBar.open('Deassigned Pupil Successfully', 'Close', {
                    horizontalPosition: 'start',
                    verticalPosition: 'bottom',
                });
            });
    }

    deassignPupilClass(pupilId, classData) {
        this.GradingService.deassignPupilClass({ "pupilId": pupilId, "classId": classData.id })
            .subscribe(pupil => {
                this.getAllClasses();
                this.snackBar.open('Deassigned Pupil Successfully', 'Close', {
                    horizontalPosition: 'start',
                    verticalPosition: 'bottom',
                });
            });
    }

    addTestView(text, val?) {
        console.log(text, val)
        if (val) {
            val["isEditOrDel"] = text
        }

        const dialogRef = this.dialog.open(addTestDialog, {
            width: '250px',
            data: val
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed', result);
            this.showClassView();
        });
    }

    fileChangeListener($event: any): void {

        const files = $event.srcElement.files;
        this.header = (this.header as unknown as string) === 'true' || this.header === true;

        // Parse the file you want to select for the operation along with the configuration
        this.ngxCsvParser.parse(files[0], { header: this.header, delimiter: ',' })
            .pipe().subscribe((result: Array<any>) => {

                console.log('Result', result);
                this.csvRecords = result;
                this.uploadResults(result);
            }, (error: NgxCSVParserError) => {
                console.log('Error', error);
            });

    }

    clearFile(event){
        console.log(event);
        this.fileImportInput.value = "";
        document.getElementById("csvFileUpload"+event)["value"] = "";
    }

    uploadResults(data) {
        console.log("data", data)
        data.map(d => {
            d.Grade = Number(d.Grade)
            this.GradingService.addTestResult(d)
                .subscribe(resp => {
                    this.showTestDetails=false;
                });
        })
    }

    editOrDelTestResults(text,val){
        val["isEditOrDel"]=text;
        if(text=="edit"){
            const dialogRef = this.dialog.open(testResultDialog, {
                width: '250px',
                data: val
            });
    
            dialogRef.afterClosed().subscribe(result => {
                console.log('The dialog was closed', result);
                this.showClassView();
            });
            
        } else {
            console.log("val",val)
            const dialogRef = this.dialog.open(testResultDialog, {
                width: '250px',
                data: val
            });
    
            dialogRef.afterClosed().subscribe(result => {
                console.log('The dialog was closed', result);
                this.showClassView();
            });
        }
    }

    getTestResultById(id){
        this.testResult = [];
        this.GradingService.getTestResultById(id)
        .subscribe(result => {
            console.log("result", result)
            this.testResult = result;
        });
    }
}

@Component({
    selector: 'addUserDialog',
    templateUrl: '../addUserDialog/addUserDialog.component.html',
})
export class addUserDialog {
    isDelete: boolean = false;
    selectedRole: string = "";
    constructor(public dialogRef: MatDialogRef<addUserDialog>, public matDialog: MatDialog, @Inject(MAT_DIALOG_DATA) public data: any, private GradingService: GradingService, private cd: ChangeDetectorRef) {
    }
    ngOnInit() {
        console.log("---", this.data)
        if (!this.data) {
            this.data = {
                "id": '',
                "username": '',
                "forename": '',
                "surname": '',
                "pwd": '',
                "roles": ['pupil', 'teacher', 'admin']
            }
            console.log("this.data.role", this.data["role"])
            this.data["role"] = this.data["role"] ? this.data["role"] : this.data.roles[0]
        }
    }

    createUser(params) {
        console.log(params);
        const isEdit = Object.keys(params).includes('isEditOrDel') ? params.isEditOrDel : '';
        this.isDelete = isEdit == 'delete' ? true : false;
        if (isEdit == 'edit') {
            delete params["actions"];
            // delete params["isEditOrDel"];
            this.GradingService.editUser(params)
                .subscribe(user => {
                    this.dialogRef.close();
                });
        } else if (isEdit == 'delete') {
            delete params["actions"];
            delete params["forename"];
            delete params["surname"];
            delete params["username"];
            delete params["pwd"];
            delete params["role"];
            console.log("params", params)
            this.GradingService.editUser(params)
                .subscribe(user => {
                    this.dialogRef.close();
                });
        } else {
            delete params["actions"];
            delete params["id"];
            delete params["isEditOrDel"];
            delete params["roles"];
            console.log("params", params)
            this.GradingService.addUser(params)
                .subscribe(user => {
                    this.dialogRef.close();
                });
        }

    }
    onChangeRole(event) {
        console.log("changed role", event.target.value)
        this.data.role = event.target.value;
    }
}


@Component({
    selector: 'addClassDialog',
    templateUrl: '../addClassDialog/addClassDialog.component.html',
})
export class addClassDialog {
    isDelete: boolean = false;
    selectedRole: string = "";
    constructor(public dialogRef: MatDialogRef<addClassDialog>, public matDialog: MatDialog, @Inject(MAT_DIALOG_DATA) public data: any, private GradingService: GradingService, private cd: ChangeDetectorRef) {
    }
    ngOnInit() {
        console.log("---", this.data)
        if (!this.data) {
            this.data = {
                "id": '',
                "name": ''
            }
        }
    }
    createClass(params) {
        console.log(params);
        const isEdit = Object.keys(params).includes('isEditOrDel') ? params.isEditOrDel : '';
        this.isDelete = isEdit == 'delete' ? true : false;
        if (isEdit == 'edit') {
            delete params["actions"];
            this.GradingService.editClass(params)
                .subscribe(user => {
                    this.dialogRef.close();
                });
        } else if (isEdit == 'delete') {
            delete params["actions"];
            delete params["name"];
            console.log("params", params)
            this.GradingService.editClass(params)
                .subscribe(user => {
                    this.dialogRef.close();
                });
        } else {
            delete params["actions"];
            delete params["id"];
            delete params["isEditOrDel"];
            console.log("params", params)
            this.GradingService.addClass(params)
                .subscribe(user => {
                    this.dialogRef.close();
                });
        }

    }

}

@Component({
    selector: 'addSubjectDialog',
    templateUrl: '../addSubjectDialog/addSubjectDialog.component.html',
})
export class addSubjectDialog {
    isDelete: boolean = false;
    selectedRole: string = "";
    constructor(public dialogRef: MatDialogRef<addSubjectDialog>, public matDialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data: any, private GradingService: GradingService,
        private cd: ChangeDetectorRef) {
    }

    teachers: User[];
    ngOnInit() {
        this.getTeachers();
        console.log("---", this.data)
        if (!this.data) {
            this.data = {
                "id": '',
                "name": '',
                "isEditOrDel": '',
                "isArchived": false,
                // "classId": 
            }
        }
        setTimeout(() => {
            if (this.data.isEditOrDel !== "edit") {
                this.data.teacherId = this.data.teachers[0].id
            }
        }, 500)

    }

    createSubject(params) {
        console.log(params);
        const isEdit = Object.keys(params).includes('isEditOrDel') ? params.isEditOrDel : '';
        this.isDelete = isEdit == 'delete' ? true : false;
        if (isEdit == 'edit') {
            delete params["actions"];
            this.GradingService.editSubject(params)
                .subscribe(user => {
                    this.dialogRef.close();
                });
        } else if (isEdit == 'delete') {
            delete params["actions"];
            delete params["name"];
            console.log("params", params)
            this.GradingService.editSubject(params)
                .subscribe(user => {
                    this.dialogRef.close();
                });
        } else {
            params["classId"] = params["id"];
            delete params["id"];
            delete params["isEditOrDel"];
            delete params["teachers"];
            console.log("params", params)
            this.GradingService.addSubject(params)
                .subscribe(user => {
                    this.dialogRef.close();
                });
        }

    }

    onChangeTeacher(event) {
        this.cd.detectChanges();
    }

    getTeachers() {
        this.GradingService.getTeachers()
            .subscribe(teachers => {
                console.log("teachers", teachers)
                this.data.teachers = teachers;
            });
    }


}

@Component({
    selector: 'assignPupilDialog',
    templateUrl: '../assignPupilDialog/assignPupilDialog.component.html',
})
export class assignPupilDialog {
    isDelete: boolean = false;
    selectedRole: string = "";
    constructor(public dialogRef: MatDialogRef<assignPupilDialog>, public matDialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data: any, private GradingService: GradingService,
        private cd: ChangeDetectorRef) {
    }

    ngOnInit() {
        this.data.pupilId = this.data.pupilList[0].id;
        console.log("---", this.data)
    }

    assignPupil(params) {
        console.log("params", params);
        this.GradingService.assignPupil({ "pupilId": params.pupilId, "subjectId": params.id })
            .subscribe(pupil => {
                this.dialogRef.close('success');
            });
    }

}

@Component({
    selector: 'addTestDialog',
    templateUrl: '../addTestDialog/addTestDialog.component.html',
})
export class addTestDialog {
    isDelete: boolean = false;
    selectedRole: string = "";
    constructor(public dialogRef: MatDialogRef<addTestDialog>, public matDialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data: any, private GradingService: GradingService,
        private cd: ChangeDetectorRef) {
    }

    ngOnInit() {
        if (this.data.isEditOrDel == "edit") {
            this.data.testName = this.data.name;
            this.data.testDate = this.data.testDate.substring(0, 10);
        }

        console.log("---", this.data)
    }

    createTest(params) {
        console.log("params", params);
        const isEdit = Object.keys(params).includes('isEditOrDel') ? params.isEditOrDel : '';

        if (isEdit == 'edit') {
            delete params["actions"];
            this.GradingService.editTest({ "name": params.testName, "testDate": params.testDate, "id": params.id })
                .subscribe(pupil => {
                    this.dialogRef.close();
                });
        } else if (isEdit == 'delete') {
            delete params["actions"];
            console.log("params", params)
            this.GradingService.editTest({ "id": params.id, "isEditOrDel": params.isEditOrDel })
                .subscribe(user => {
                    this.dialogRef.close();
                });
        } else {
            this.GradingService.addTest({ "name": params.testName, "testDate": params.testDate, "subjectId": params.id })
                .subscribe(pupil => {
                    this.dialogRef.close();
                });
        }

    }


}

@Component({
    selector: 'assignPupilClassDialog',
    templateUrl: '../assignPupilClassDialog/assignPupilClassDialog.component.html',
})
export class assignPupilClassDialog {
    isDelete: boolean = false;
    selectedRole: string = "";
    constructor(public dialogRef: MatDialogRef<assignPupilClassDialog>, public matDialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data: any, private GradingService: GradingService,
        private cd: ChangeDetectorRef) {
    }

    ngOnInit() {
        console.log("---", this.data)
        this.data.pupilId = this.data.pupilList[0].id;
    }

    assignPupilClass(params) {
        console.log("params", params);
        this.GradingService.assignPupilClass({ "pupilId": params.pupilId, "classId": params.id })
            .subscribe(pupil => {
                this.dialogRef.close('success');
            });
    }

}

@Component({
    selector: 'testResultDialog',
    template: `
    <div>
    <div *ngIf="data && data.isEditOrDel=='edit'">
        <b>Edit Test Result</b>
    </div>
    
    <br/>
    <br/>
    <form class="example-form" *ngIf="data.isEditOrDel!=='delete'">
            <p>Test Name : {{data.name}}</p>
            <p>Pupil Name : {{data.username}}</p>

        <br/>
        <br/>
            <label>Grade</label>
            <input matInput (change)="data.grade = $event.target.value" value="{{data.grade}}">
        <br />
        <button mat-raised-button class="btnAdd" *ngIf="data.isEditOrDel=='edit'" (click)="createTestResult(data)">Edit</button>
        </form>

    <div *ngIf="data.isEditOrDel=='delete'">
        <p>Are you sure you want to delete the result of "{{data.name}}" Test by Pupil "{{data.username}}"?</p>
        <button (click)="deleteTestResult(data.pupilId,data.testId)">Yes</button>
        <button (click)="dialogRef.close()" style="float:right">Cancel</button>
    </div>
</div>
    `,
})
export class testResultDialog {
    constructor(public dialogRef: MatDialogRef<testResultDialog>, public matDialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data: any, private GradingService: GradingService,
        private cd: ChangeDetectorRef) {
    }

    ngOnInit() {
        console.log("---", this.data)
    }

    createTestResult(val) {
        console.log("val", val);
            const jsonData = {TestName:val.name, PupilUserName:val.username, Grade:val.grade}
            
            this.GradingService.addTestResult(jsonData)
                .subscribe(resp => {
                this.dialogRef.close('success');
                });
    }

    deleteTestResult(pupilId,testId){
        this.GradingService.deleteTestResult(pupilId,testId)
                .subscribe(resp => {
                this.dialogRef.close('success');
                });
    }

}
