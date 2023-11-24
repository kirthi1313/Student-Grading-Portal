 export interface User {
   id: string;
   forename: string;
   surname: string;
   username: string;
   pwd: string;
   role:string;
 }

 export interface Class {
  id: string;
  name: string;
}

export interface Subject {
  id?: string;
  name: string;
  teacherId: number;
  isArchived: boolean;
  pupil?: User[];
}

export interface Test{
  id?: string;
  name: string;
  testDate: string;
}