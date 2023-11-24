import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { faTrashAlt, faEdit, faPlusSquare, faCommentAlt } from '@fortawesome/free-solid-svg-icons';
import { NgxCsvParser, NgxCSVParserError } from 'ngx-csv-parser';
import { iif } from 'rxjs';
import { Class, Subject, User } from '../grading';

import { GradingService } from '../grading.service';


@Component({
    selector: 'app-pupil',
    templateUrl: './pupil.component.html',
    styleUrls: ['./pupil.component.css']
})
export class PupilComponent implements OnInit {
    constructor(public GradingService: GradingService, private cd: ChangeDetectorRef,
        public dialog: MatDialog, public snackBar: MatSnackBar,
        private ngxCsvParser: NgxCsvParser) { }

    dataSource: any[] = [];
    dataSourceMsg: any[] = [];
    displayedColumns: string[];
    displayedCols: string[];
    displayedColumnsMsg: string[];
    receivers = [];

    data = [];
    dataSrc: any[] = [];
    showTests: boolean;

    faTrashAlt = faTrashAlt;
    faEdit = faEdit;
    faPlusSquare = faPlusSquare;
    faCommentAlt = faCommentAlt;
    csvRecords: any[] = [];
    header = true;
    unreadMsgCt: number;
    userId: number;
    isMessageView: boolean = false;

    ngOnInit() {
        const id = Number(sessionStorage.getItem('id'))
        this.userId = id;
        console.log("in pupil", id)
        this.showUserDetails(id);
        this.getAllMessages();
    }

    downloadFile() {
        let data = this.dataSource;
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
        a.download = 'studentViewFile.csv';
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    }

    showUserDetails(id) {

        this.dataSource = [];
        this.displayedColumns = ["subjectName", "totGrade"];
        this.GradingService.getPupilTestResultById(id).subscribe(res => {
            const distinctSubj = res.map(x => x.subjectName).filter((value, index, self) => self.indexOf(value) === index)
            distinctSubj.forEach(x => {
                const ct = res.filter(y => y.subjectName == x).length;
                res.filter(y => y.subjectName == x).map(v => {
                    if (this.data.filter(z => z.subjectName == x).length == 0) {
                        this.data.push({ "subjectId": v.subjectId, "pupilId": v.pupilId, "subjectName": x, "totGrade": v.grade, "count": ct })
                    } else {
                        this.data.filter(z => z.subjectName = x).map(d => d.totGrade = (d.totGrade + v.grade))
                    }
                })
            })
            console.log("user", this.data)

        });
        setTimeout(() => {
            this.dataSource = [...this.data];
            console.log("dataSource", this.dataSource)
            this.cd.detectChanges();
        }, 1000);
    }

    showSubjectDetails(element) {
        console.log("clicked", element)
        this.GradingService.getPupilTestResultBySubject(element.pupilId, element.subjectId).subscribe(res => {

            console.log("---", res)
            this.showTestDetails(res);
        });
    }

    showTestDetails(val) {
        this.showTests = true;
        this.displayedCols = ["testName", "grade"]
        this.dataSrc = val;
    }

    showMessages() {
        this.isMessageView = true;
        this.getAllMessages();
        this.displayedColumnsMsg = ["from", "dateSent", "message", "read"];

    }

    getAllMessages(){
        this.GradingService.getMessages(this.userId).subscribe(resp=>{
            console.log("resp",resp);
            this.dataSourceMsg = resp;
            this.unreadMsgCt = resp.filter(x=>x.isRead==0).length;
        })
    }

    getReceivers() {
        this.receivers = [];
        this.GradingService.getMessageUsersForPupil(this.userId).subscribe(user=>{
            console.log("------::::",user);
            user.map(x=>{
                if(x.id!==this.userId){
                    this.receivers.push(x)
                }
            })
        })
    }


    markAsRead(val){
        this.GradingService.markMessageAsRead({"id":val.messageId}).subscribe(resp=>{
            console.log("read")
            this.getAllMessages();
        })
    }

    addMessage(val) {
        this.getReceivers();
        const dialogRef = this.dialog.open(addMessageDialog, {
            width: '250px',
            data: {"id":val, "receivers": this.receivers}
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed', result);
            this.showMessages();
        });
    }
}

@Component({
    selector: 'addMessageDialog',
    templateUrl: '../addMessageDialog/addMessageDialog.component.html',
})
export class addMessageDialog {
    isDelete: boolean = false;
    selectedRole: string = "";
    users = [];
    showMessagingSystem: boolean;
    constructor(public dialogRef: MatDialogRef<addMessageDialog>, public matDialog: MatDialog, @Inject(MAT_DIALOG_DATA) public data: any, private GradingService: GradingService, private cd: ChangeDetectorRef) {
    }
    ngOnInit() {
        console.log("---", this.data)
        if(this.data.receivers.length){
            this.showMessagingSystem=true;
        }
        this.data.userId = this.data.receivers[0].id;
        this.data.userName = this.data.receivers[0].userName ? this.data.receivers[0].userName : this.data.receivers[0].username;
    }

    createMessage(data) {
        console.log("msg", data);
        let obj = {
            sender: data.id,
            receiver: data.userId,
            msg: data.msg
        }
        this.GradingService.createMessage(obj).subscribe(resp => {
            this.dialogRef.close()
        })
    }

}
