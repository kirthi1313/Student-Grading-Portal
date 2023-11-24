import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { faTrashAlt, faEdit, faPlusSquare, faCommentAlt } from '@fortawesome/free-solid-svg-icons';
import { NgxCsvParser, NgxCSVParserError } from 'ngx-csv-parser';
import { Class, Subject, User } from '../grading';

import { GradingService } from '../grading.service';
import { addMessageDialog } from '../pupil/pupil.component';


@Component({
    selector: 'app-teacher',
    templateUrl: './teacher.component.html',
    styleUrls: ['./teacher.component.css']
})
export class TeacherComponent implements OnInit {
    constructor(public GradingService: GradingService, private cd: ChangeDetectorRef,
        public dialog: MatDialog, public snackBar: MatSnackBar,
        private ngxCsvParser: NgxCsvParser) { }

    isUsersView: boolean; isClassView: boolean; showTestDetails: boolean;
    dataSource: any[] = [];
    dataSourceMsg: any[] = [];
    displayedColumnsMsg: string[];
    displayedColumns: string[];
    data: any[] = []; classes: Class[]; subjects: any[]=[]; pupil: User[]; tests: any[]=[];
    testResult = [];
    receivers = [];
    selSubjectId:number;
    
    responseData = [];
    faTrashAlt = faTrashAlt;
    faEdit = faEdit;
    faPlusSquare = faPlusSquare;
    faCommentAlt = faCommentAlt;
    
    csvRecords: any[] = [];
    header = true;
    isMessageView: boolean = false;
    unreadMsgCt: number = 0;

    ngOnInit() {
        console.log("in teacher");
        this.getSubjectsByTeacherId();
        this.getAllMessages();
    }

    downloadFile() {
        let data = this.responseData;
        const replacer = (key, value) => (value === null ? '' : value); // specify how you want to handle null values here
        const header = Object.keys(data[0]);
        const csv = data.map((row) =>
          header
            .map((fieldName) => JSON.stringify(row[fieldName], replacer))
            .join(',')
        );
        csv.unshift(header.join(','));
        const csvArray = csv.join('\r\n');
        const a = document.createElement('a');
        const blob = new Blob([csvArray], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
      
        a.href = url;
        a.download = 'teacherViewFile.csv';
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      }

    getSubjectsByTeacherId() {
        // this.dataSource = [];
        // this.displayedColumns = ["id", "forename", 'surname', 'username', 'pwd', 'role', 'actions'];
        let id = sessionStorage.getItem("id");
        this.GradingService.getSubjectsByTeacherId(id)
            .subscribe(data => {
                console.log("data", data)
                this.responseData = data;
                this.getSubjects(data);
            });
        setTimeout(() => {
            // this.dataSource = [...this.users];
            // console.log("dataSource", this.dataSource)
            // this.cd.detectChanges();
        }, 1000);
    }

    getSubjects(res) {
        this.subjects=[]
        const distinctSubj = res.map(x => x.subjectName).filter((value, index, self) => self.indexOf(value) === index)
        console.log(distinctSubj);
        distinctSubj.forEach(ds => {
            let id = res.filter(x=>x.subjectName==ds)[0].subjectId;
            let className = res.filter(x=>x.subjectId==id)[0].className;
            if(this.subjects==[]  || (this.subjects && this.subjects.filter(v=>v.id==id).length==0)){
                this.subjects.push({"id":id,"subjectName":ds,"className":className})
            }
        })
        console.log(this.subjects)
        this.selSubjectId = this.subjects[0].id
    }

    filterSubject(id){
        this.tests=this.testResult=[];
        console.log("id",id,this.responseData);
        this.getTests(id);
    }

    getTests(id){
        const distinctSubj = this.responseData.filter(x=>x.subjectId==id).map(x => x.testName).filter((value, index, self) => self.indexOf(value) === index)
        console.log(distinctSubj);
        this.tests = [];
        distinctSubj.forEach(ds => {
            let testid = this.responseData.filter(x=>x.subjectId==id && x.testName==ds)[0].testId;
            let testDate = this.responseData.filter(x=>x.subjectId==id && x.testName==ds)[0].testDate;
            if(this.tests==[]  || (this.tests && this.tests.filter(v=>v.id==testid).length==0)){
                this.tests.push({"id":testid,"testName":ds,"testDate":testDate})
            }
        })
        console.log(this.tests)
    }

    filterTest(id){
        console.log(id)
        this.testResult = [];
        this.GradingService.getTestResultById(id)
        .subscribe(result => {
            console.log("result", result)
            this.testResult = result;
        });
    }

    addTestView(text, val?) {
        console.log(text, val)
        let value = {"id":val};
        if (val) {
            value["isEditOrDel"] = text
        }

        const dialogRef = this.dialog.open(addTestTeacherDialog, {
            width: '250px',
            data: value
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed', result);
            this.ngOnInit();
        });
    }

    editTestResult(text, val?) {
        console.log(text, val)
        if (val) {
            val["isEditOrDel"] = text
        }

        const dialogRef = this.dialog.open(addResultDialog, {
            width: '250px',
            data: val
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed', result);
            // window.location.reload()
            this.getSubjectsByTeacherId();
        });
    }

    editTest(text, val?) {
        console.log(text, val)
        if (val) {
            val["isEditOrDel"] = text
        }

        const dialogRef = this.dialog.open(addTestTeacherDialog, {
            width: '250px',
            data: val
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed', result);
            // window.location.reload()
            this.getSubjectsByTeacherId();
        });
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

    markAsRead(val){
        this.GradingService.markMessageAsRead({"id":val.messageId}).subscribe(resp=>{
            console.log("read")
            this.getAllMessages();
        })
    }

    getMessageUsersForTeacher(id){
        this.receivers = [];
        this.GradingService.getMessageUsersForTeacher(id).subscribe(resp=>{
            console.log("resp",resp);
            this.receivers = resp;
        })
    }

    addMessage() {
        const id = sessionStorage.getItem("id");
        this.getMessageUsersForTeacher(id);
        setTimeout(()=>{
            const dialogRef = this.dialog.open(addMessageDialog, {
                width: '250px',
                data: {"id":id,"userId":id, "receivers": this.receivers}
            });
    
            dialogRef.afterClosed().subscribe(result => {
                console.log('The dialog was closed', result);
                this.showMessages();
            });
        },1000)
        
    }
    
}

@Component({
    selector: 'addTestTeacherDialog',
    templateUrl: '../addTestDialog/addTestDialog.component.html',
})
export class addTestTeacherDialog {
    isDelete: boolean = false;
    selectedRole: string = "";
    header=true;
    csvRecords=[];
    showErrorMsg:boolean;
    msg:string;
    @ViewChild('fileImportInput', { static: false }) fileImportInput: any;

    constructor(public dialogRef: MatDialogRef<addTestTeacherDialog>, public matDialog: MatDialog,private ngxCsvParser: NgxCsvParser,
        @Inject(MAT_DIALOG_DATA) public data: any, private GradingService: GradingService,
        private cd: ChangeDetectorRef) {
    }

    ngOnInit() {
        this.showErrorMsg=false;
        this.data.role="teacher";
        this.data.name = this.data.testName;

        if (this.data.isEditOrDel == "edit") {
            this.data.testDate = this.data.testDate.substring(0, 10);
        } else if (this.data.isEditOrDel == "") {
            this.data.testName = "";
            this.data.testDate = "";
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
            console.log("params11", params)
            this.GradingService.deleteTestAndResult({ "testId": params.id})
                .subscribe(user => {
                    this.dialogRef.close();
                });
        } else {
            if(this.csvRecords || this.csvRecords.length>0){
                const distinctSubj = this.csvRecords.map(x=>x.TestName).filter((value, index, self) => self.indexOf(value) === index)
                if(distinctSubj.length==1 && this.data.testName==distinctSubj){
                this.GradingService.addTest({ "name": params.testName, "testDate": params.testDate, "subjectId": params.id })
                    .subscribe(pupil => {
                        this.uploadResults(this.csvRecords);
                    });
                } else {
                    this.showErrorMsg=true;
                    this.msg="Test Names mismatch.Please update and upload."
                }
            } else {
                this.showErrorMsg=true;
                this.msg="Please upload test result."
            }
            
        }

    }
    clearFile(){
        this.fileImportInput.value = "";
        document.getElementById("csvFileUpload")["value"] = "";
    }
    uploadResults(data) {
        console.log("data", data) 
            data.map(d => {
                d.Grade = Number(d.Grade)
                this.GradingService.addTestResult(d)
                    .subscribe(resp => {
                        // this.showTestDetails=false;
                    this.dialogRef.close();
                    });
            })
    }
    fileChangeListener($event: any): void {

        const files = $event.srcElement.files;
        this.header = (this.header as unknown as string) === 'true' || this.header === true;

        // Parse the file you want to select for the operation along with the configuration
        this.ngxCsvParser.parse(files[0], { header: this.header, delimiter: ',' })
            .pipe().subscribe((result: Array<any>) => {

                console.log('Result', result);
                this.csvRecords = result;
                // this.uploadResults(result);
            }, (error: NgxCSVParserError) => {
                console.log('Error', error);
            });
    }
}

@Component({
    selector: 'addResultDialog',
    template: `
    <p>
    <mat-form-field *ngIf="data.isEditOrDel=='edit'" class="example-full-width">
        <mat-label>Grade</mat-label>
        <input matInput (change)="data.grade = $event.target.value" value="{{data.grade}}">
      </mat-form-field>

      <mat-form-field *ngIf="data.isEditOrDel!=='edit'" class="example-full-width">
      <label>Are you sure you want to delete the grade?</label><br/>
      <button (click)="dialogRef.close()">Cancel</button>
      <button (click)="deleteTestResult()">Yes</button>
    </mat-form-field>

      <button *ngIf="data.isEditOrDel=='edit'" (click)="editTestResult()">Edit</button>
    </p>
    `,
})
export class addResultDialog {
    isDelete: boolean = false;
    selectedRole: string = "";
    header=true;
    csvRecords=[];
    showErrorMsg:boolean;
    msg:string;
    @ViewChild('fileImportInput', { static: false }) fileImportInput: any;

    constructor(public dialogRef: MatDialogRef<addResultDialog>, public matDialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data: any, private GradingService: GradingService,
        private cd: ChangeDetectorRef) {
    }

    ngOnInit() {
        console.log("---", this.data)
    }

    editTestResult(){
        let rec={"id":this.data.testId,"uid":this.data.pupilId,"grade":this.data.grade}
        this.GradingService.editTestResultById(rec).subscribe(resp=>{
            this.dialogRef.close();
        })
    }
    deleteTestResult(){
        this.GradingService.deleteTestResult(this.data.pupilId,this.data.testId)
                .subscribe(resp => {
                this.dialogRef.close('success');
                });
    }

}
