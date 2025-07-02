import dotenv from 'dotenv';
dotenv.config();

export const mongoURI = process.env.MONGO_URI || 'mongodb://root:DWX6i77QlWItkQpqVyPvTDDwvMFs4ime1ARHoadMXl1rruAx1pg91VOTGeyTUow3@147.93.68.31:17500/?directConnection=true';
export const port = process.env.PORT || 3000;
