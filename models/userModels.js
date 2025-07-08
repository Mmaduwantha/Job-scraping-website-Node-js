import pool from '../db.js';
import categories from '../categories.js';

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
            return result.rows[0]
            
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
                const role = 'user';
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
    static async register(email, fullName, dateOfBirth, location, currentStatus, jobRoll, skill, experince, education, description,role) {
    try {
        const checkExist = await this.checkExist(email);

        if (checkExist) {
            const userId = await this.checkId(email);

            if (!userId) {
                console.log('User not found for the given email.');
                return null;
            }

            const result = await pool.query(
                `UPDATE users 
                 SET fullName = $1, dateOfBirth = $2, location = $3, currentStatus = $4, 
                     jobRoll = $5, skill = $6, experince = $7, education = $8, description = $9, role = $10
                 WHERE id = $11 RETURNING *`,
                [fullName, dateOfBirth, location, currentStatus, jobRoll, skill, experince, education, description,role, userId]
            );

            return result.rows[0];
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
                return { authenticated: false, role: null };
            }
    
            const user = result.rows[0];
    
            if (user.password.trim() === password.trim()) {
                if (user.role.trim() === 'admin') {
                    console.log('Login successful as admin!');
                    return { authenticated: true, role: 'admin' };
                } else {
                    console.log('Login successful as user!');
                    return { authenticated: true, role: 'user' };
                }
            } else {
                console.log('Password does not match.');
                return { authenticated: false, role: null };
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

    //Function to fetch the CV JSON from the database
    static async getUserCV(userId) {
    try {
        const res = await pool.query('SELECT id FROM users WHERE id = $1', [userId]);
        if (res.rows.length === 0) {
            throw new Error('CV not found for the given user ID.');
        }
    return res.rows[0].cv_json;
  } catch (err) {
    console.error('Error retrieving CV:', err);
    throw err;
  } 
}
    

//Function to extract the "label" field from the CV JSON
    static async getUserLabel(userId) {
    try {
        const cvJson = await getUserCV(userId);
        const cv = JSON.parse(cvJson); // Parse the JSON string into an object
        const label = cv.basics?.label; // Optional chaining to safely access the label
        if (!label) {
        throw new Error('Label not found in the CV.');
        }
        return label;
    } catch (err) {
    console.error('Error extracting label:', err);
    throw err;
  }
}

    static async categorizeCV(label) {
        const cvTitle = label.title.toLowerCase();
        let cvCategory = 'Uncategorized';

        Object.entries(categories).forEach(([category, keywords]) => {
            keywords.forEach(keyword => {
                if (cvTitle.includes(keyword)) {
                    cvCategory = category;
            }
        });
    });

    return cvCategory;
}
    
}

export default UserModel;