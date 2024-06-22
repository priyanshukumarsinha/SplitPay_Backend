import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({})

const connectDB = async () => {
    try {
        const connectionInstance = await prisma.$connect(`${process.env.DATABASE_URL}`);
        console.log("MySQL Connection Established Successfully! ", connectionInstance);
    } catch (error) {
        console.log("MySQL Connection ERROR ", error);
        process.exit(1);
    }
}

export default connectDB;