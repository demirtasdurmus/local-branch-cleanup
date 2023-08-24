import { readdirSync, statSync, rmdirSync } from 'fs';
import { join } from 'path';

export function cleanEmptyFoldersRecursively(folder: string) {
    const isDir = statSync(folder).isDirectory();
    if (!isDir) {
        return;
    }

    let files = readdirSync(folder);
    if (files.length > 0) {
        files.forEach(function (file) {
            const fullPath = join(folder, file);
            cleanEmptyFoldersRecursively(fullPath);
        });
        files = readdirSync(folder);
    }

    if (files.length == 0) {
        console.log('removing: ', folder);
        rmdirSync(folder);
        return;
    }
}
