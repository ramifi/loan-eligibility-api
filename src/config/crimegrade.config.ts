import * as path from 'path';

export const filesPath = process.env['FILES_PATH'] || path.join(process.cwd(), "files");
export const filename = process.env['CRIMEGRADE_FILENAME'] || "crime-grade.csv";

