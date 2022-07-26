export interface UserListingInterface{
    CreatedAt: string
    UpdatedAt: string
    email: string
    firstName: string
    id: number
    lastName: string
    phoneNumber: string
    regionId: number;
    regionName: string;
    role: number
    status: number
}

export interface findUserForLoginDataInterface{
    id:number
    email:string
    firstName:string
    lastName:string
    phoneNumber:string
    regionId:number
    role:number
    status:number
    setTemporaryPassword:string
    CreatedAt:string
    UpdatedAt:string
    salt?:string
    hash?:string
    fullName:string
    companyId?:number
    isCompanyOwner?:boolean,
    last_logged_in: string
}

export interface userMetaDataInterface{
    firstName:string;
    lastName:string;
    email:string;
    createdUserId:number;
    createdFullName:string;
    updatedUserId:number;
    updatedFullName:string;
    userCreatedAt:string;
    userUpdatedAt:string;
    phoneNumber:string;
    regionName:string;
};