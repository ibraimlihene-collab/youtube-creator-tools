import {handleBrain} from './_brain/http.mjs';
export default request=>handleBrain(request);
export const config={path:'/api/knowledge-brain/*'};
