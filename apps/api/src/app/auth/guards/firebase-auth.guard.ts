import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import {type Request} from 'express'
import { admin } from "../firebase-admin.module";
export type ReqWithUser = Request & {
    user: {
        id: string,
        email: string
    }
    token: string
}
@Injectable()
export class FirebaseAuthGuard implements CanActivate {
 public async canActivate(context: ExecutionContext): Promise<boolean> {
     const request = context.switchToHttp().getRequest<ReqWithUser>();
     const sessionCookie = request.cookies.session as string | undefined | null;
     if(!sessionCookie) return false;
     try {
        const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie)
        if(!decodedClaims.email) return false;
        request.user = {
            id: decodedClaims.dbUserId,
            email: decodedClaims.email
        }
        return true;
     } catch (error) {
        return false;
     }
 }
}