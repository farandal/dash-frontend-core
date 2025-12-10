export interface IDashNotificationPayloadBase {
    notifiable?: any;
    modelInstance?: number;
    model?: string;
    targetType?: string;
    mailSubject?: string;
    timestamp?: string;
    targetRoles?: string[];
    notify: "dialog" | "toast" | "none";
    type?:string
    data?:any
    notificationPayload?:any;
}

export interface IDashNotificationBase<T> {
    class?: string;
    title?: string;
    message?: string;
    notificationPayload?: T

}