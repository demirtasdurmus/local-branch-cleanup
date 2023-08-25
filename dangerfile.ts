// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');
import { danger, message, markdown, warn } from 'danger';

markdown(`
:wave: Hello ${danger.github.pr.user.login} and thank you for your contribution!
---------------
​
Before the reviewers could start with a code review process, please ensure that **all** the following points in your pull request (PR) are fulfilled:
​
- Each variable and function inside component or service should contain a short code description (JSDoc-TSDoc)
- In our Typescript applications we always try to avoid the type **any** and define new types or interfaces therefore
- For the names of classes, functions or variables we use **camelCase** style (capitalized style for classes)
- Code documentation for functions, classes, interfaces etc. should be written in capitalized style
`);

const documentation = danger.git.fileMatch('**/*.md');
// Thank folks for making doc changes
if (documentation.edited) {
    message('Thanks - We :heart: our [documentarians](http://www.writethedocs.org/)!');
}

// No PR is too small to include a description of why you made a change
if (danger.github.pr.body.length < 100) {
    warn(':pencil: Please include a description of your PR changes.');
}

// Check that someone has been assigned to this PR
if (danger.github.pr.assignees.length === 0) {
    warn(':man_technologist: Please assign someone to review this PR.');
}

const packageChanged = danger.git.modified_files.includes('package.json');
const lockfileChanged = danger.git.modified_files.includes('package-lock.json');

if (packageChanged) {
    message(`:man_technologist: Some dependencies were added or removed in package.json file.`);
}

if (packageChanged && !lockfileChanged) {
    warn(`:thinking: Changes were made to \`package.json\`, but not to \`package-lock.json\`.
If you’ve changed any dependencies (added, removed or updated any packages), please run \`npm install\` and commit changes in package-lock.json file. Make sure you’re using npm 9+.`);
}

if (!packageChanged && lockfileChanged) {
    warn(`:thinking: Changes were made to \`package-lock.json\`, but not to \`package.json\`.
Please remove \`package-lock.json\` changes from your pull request. Try to run \`git checkout master -- package-lock.json\` and commit changes.`);
}

// Warn when there is a big PR
danger.git.linesOfCode().then((lines) => {
    const linesThreshold = 1000;
    if (lines && lines > linesThreshold) {
        warn(
            `:thinking: Wow, this one looks like a big pull request. For your next PR please try to split your PR into smaller PR's. (> ${linesThreshold} line of code)`,
        );
    }
    message(`:tada: This PR changed ${lines} lines of code in the project.`);
});

const modifiedHtmlFiles = danger.git.modified_files.filter((path) => path.endsWith('html'));

// check the kebab case style in the class attribute of html tags
modifiedHtmlFiles.forEach((file) => {
    const notKebabCaseRegex = /class="(?!\s*[a-z0-9]+(?:[\s-][a-z0-9]+)*\s*")[^"]+"/g;
    const content = fs.readFileSync(file).toString();
    let match: string[] | null;
    while ((match = notKebabCaseRegex.exec(content)) != null) {
        fail(
            `\`${match}\` - wrong styling of a class attribute was found in file (\`${file}\`). Please use kebab-case for class names.`,
        );
    }
});

// check whether test files were added or not
const hasTests = danger.git.modified_files.filter((path) => path.endsWith('.spec.ts') || path.endsWith('.e2e-spec.ts'));
if (hasTests.length === 0) {
    warn(
        ':thinking: Well, it seems like that there are no tests in this PR. Please think about the test coverage of the added functionality and feel free to ask for help if you need it.',
    );
} else {
    message(':+1: Wow, there are tests in the PR, let*s keep it going!');
}

const { commits } = danger.git;
// check whether commits include message with 'fix:' and 'feat(' prefix
const patchVersionChanged = commits.find(
    (commit) => !!commit.message.includes('fix:') || !!commit.message.includes('fix('),
);

// check whether commits include message with 'feat:' and 'feat(' prefix
const minorVersionChanged = commits.find(
    (commit) => !!commit.message.includes('feat:') || !!commit.message.includes('feat('),
);

// check whether commits include message with 'BREAKING CHANGES' prefix
const majorVersionChanged = commits.find((commit) => !!commit.message.includes('BREAKING CHANGES'));
if (majorVersionChanged) {
    message(
        ':+1: This PR contains commits with "BREAKING CHANGES", that will increase the major version of the project. The major version will be changed.',
    );
} else if (minorVersionChanged) {
    message(
        ':tada: This PR contains commits that are prefixed with "feat", that will increase the semantic version of the project. The minor version will be changed.',
    );
} else if (patchVersionChanged) {
    message(
        ':tada: This PR contains that are prefixed with "fix", that will increase the semantic version of the project. The patch version will be changed.',
    );
} else {
    message(
        ':+1: This PR will not affect the semantic version of the project. Remember: Refactoring is always a good idea. :pray:',
    );
}
