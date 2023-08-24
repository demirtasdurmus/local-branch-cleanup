import { series, task } from 'gulp';
import { sources } from '../config';
import * as del from 'del';
import { cleanEmptyFoldersRecursively } from '../utils/clean-empty-dir-recursively.util';

function cleanOutput() {
    const files = sources
        .map((source) => {
            return [`${source}/**/*.js`, `${source}/**/*.d.ts`, `${source}/**/*.js.map`, `${source}/**/*.d.ts.map`];
        })
        .reduce((a, b) => a.concat(b), []);

    return del(files);
}

function cleanDirs(done: () => void) {
    sources.forEach((source) => cleanEmptyFoldersRecursively(`${source}/`));
    done();
}

task('clean:output', cleanOutput);
task('clean:dirs', cleanDirs);
task('clean:bundle', series('clean:output', 'clean:dirs'));
