import bcrypt from "bcryptjs"

export async function hashPassword (password : string){
    try{
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);
        return hashedPassword;
    }catch(error){
        console.log("Error in hashing password : ",error);
    }
}

export async function comparePasswords (plainPassword : string ,hashedPassword : string){
    try{
        const check = await bcrypt.compare(plainPassword,hashedPassword);
        return check;
    }catch(error){
        console.log("Error in comparing passwords : ",error);
    }
}
