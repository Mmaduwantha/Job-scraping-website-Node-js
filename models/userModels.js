import pool from '../db.js';

const saltRounds = 12;

class UserModel {
    // Fetch all users
    static async getAll() {
        try {
            const result = await pool.query('SELECT * FROM users');
            return result.rows;
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    }
    static async get(email){
        try{
            const result =  await pool.query('SELECT * FROM users WHERE email = $1', [email]);
            if(result.rows.length>0){
                return result.rows[0]
            }else{
                return null
            }
        }
        catch (error){
            console.error('Error getting user:', error);
            throw error;
        }
    }

    // Add a new user
    static async signUp(fullName, email, password) {
        try {
            const checkExist = await this.checkExist(email);

            if (!checkExist) {
                const result = await pool.query(
                    'INSERT INTO users (fullName, email, password) VALUES ($1, $2, $3) RETURNING *',
                    [fullName, email, password]
                );
                return result.rows[0];
            } else {
                console.log('User already exists');
                return null;
            }
        } catch (error) {
            console.error('Error adding user:', error);
            throw error;
        }
    }
    //register user
    static async register(email, fullName, dateOfBirth, location, currentStatus, jobRoll, skill, experience, education, description) {
        try {
            // Check if the user exists
            const checkExist = await this.checkExist(email);
    
            if (checkExist) {
                // Get the user's ID
                const userId = await this.checkId(email);
    
                if (!userId) {
                    console.log('User not found for the given email.');
                    return null;
                }
    
                // Update the user details
                const result = await pool.query(
                    `UPDATE users 
                     SET fullName = $1, dateOfBirth = $2, location = $3, currentStatus = $4, 
                         jobRoll = $5, skill = $6, experince = $7, education = $8, description = $9 
                     WHERE id = $10 RETURNING *`,
                    [fullName, dateOfBirth, location, currentStatus, jobRoll, skill, experience, education, description, userId]
                );
    
                return result.rows[0]; // Return updated user details
            } else {
                console.log('User does not exist.');
                return null;
            }
        } catch (error) {
            console.error('Error updating user details:', error);
            throw error;
        }
    }
    
    

    // Check if the user is logged in
    static async isLogged(req) {
        try {
            return req.isAuthenticated();
        } catch (error) {
            console.error('Error checking login status:', error);
            throw error;
        }
    }
    //check existing users
    static async checkExist(email) {
        try {
            const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
            return result.rows.length > 0;
        } catch (error) {
            console.error('Error checking if user exists:', error);
            throw error;
        }
    }
    //check login
    static async logIn(email, password) {
        try {
        
            const result = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    
            if (result.rows.length === 0) {
                console.log('No user found with this email.');
                return false;
            }
    
            const user = result.rows[0];
    
            if (user.password.trim() === password.trim()) {
                console.log('Login successful!');
                return true;
            } else {
                console.log('Password does not match.');
                return false;
            }
        } catch (error) {
            console.error('Error logging in:', error);
            throw error;
        }
    }
    // Check if user exists by email
    static async checkExist(email) {
        try {
            const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
            return result.rows.length > 0;
        } catch (error) {
            console.error('Error checking if user exists:', error);
            throw error;
        }
    }

    //check id using email
    static async checkId(email) {
        try {
            const result = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
            if (result.rows.length > 0) {
                return result.rows[0].id; // Return only the ID
            } else {
                return null; // User not found
            }
        } catch (error) {
            console.error('Error checking ID:', error);
            throw error;
        }
    }
    
    
}

export default UserModel;