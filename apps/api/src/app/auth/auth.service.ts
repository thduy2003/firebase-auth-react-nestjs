import { User } from '@myorg/api-client';
import { Injectable, Logger } from '@nestjs/common';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { admin } from './firebase-admin.module';
import { prisma } from '../prisma.module';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name)
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    constructor() {}
    public async verifyAndUpsertUser(accessToken: string): Promise<{
        decodedToken: DecodedIdToken,
        userInfo: User
    }> {
        const decodedToken = await admin.auth().verifyIdToken(accessToken)
        const userInfo = await prisma.user.upsert({
            where: {email: decodedToken.email},
            create: {
                email: decodedToken.email,
                name: decodedToken.name,
                img: decodedToken.picture
            },
            update: {
                name: decodedToken.name,
                img: decodedToken.picture
            },
            select: {
                name: true,
                email: true,
                img: true,
                id: true,
            }
        })
        await admin.auth().setCustomUserClaims(decodedToken.uid, {
            dbUserId: userInfo.id
        })
        return {
            decodedToken,
            userInfo
        }
    }
    public async createSessionCookie(accessToken: string): Promise<{
        expiresIn: number;
        sessionCookie: string;
    }> {
        const expiresIn: number = 60*60*24*5; // 5 days
        const sessionCookie = await admin.auth().createSessionCookie(accessToken, {
            expiresIn
        })
        return {
            expiresIn,
            sessionCookie
        }
    }
}
