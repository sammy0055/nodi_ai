import 'dotenv/config';
import { EnvList } from '../config';
export const getEnv = (envName: `${EnvList}`) => process.env[envName]!;
