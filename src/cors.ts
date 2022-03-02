import { CorsOptions } from "cors";
import cors from "cors";

/* holdover from another project, makes it easy to do this in frontend stuff */
export const copts: CorsOptions = {
    origin: (origin, callback) => { // allow all
        callback(null, true);
    }
};
