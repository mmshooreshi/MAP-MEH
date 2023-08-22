import * as path from 'node:path'
import * as fs from 'node:fs'
import { readdir } from 'fs/promises';


export default defineEventHandler(async (event) => {
  const filePath = path.join(process.cwd(), 'public', 'data/accum_runs')
  const data = await fs.promises.readdir(filePath)
  const ndata=[]

try {
  const files = await readdir(filePath);
  for (const file of files){
    console.log(file);
    ndata.push(file);
}
} catch (err) {
  console.error(err);
}
  return ndata
})
