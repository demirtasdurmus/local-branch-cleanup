import type { UserConfig } from '@commitlint/types';

const Configuration: UserConfig = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'subject-case': [2, 'always', ['sentence-case', 'start-case', 'pascal-case', 'upper-case', 'lower-case']],
        'type-enum': [
            2,
            'always',
            [
                'build', // Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
                'chore', // Other changes that don't modify src or test files
                'ci', // Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)
                'docs', // Documentation only changes
                'feat', // A new feature
                'fix', // A bug fix
                'perf', // A code change that improves performance
                'refactor', // A code change that neither fixes a bug nor adds a feature
                'revert', // Reverts a previous commit
                'style', // Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
                'test', // Adding missing tests or correcting existing tests,
                'sample', // Sample code
            ],
        ],
    },
    ignores: [(message) => /^Bumps \[.+]\(.+\) from .+ to .+\.$/m.test(message)],
    helpUrl: 'https://github.com/conventional-changelog/commitlint/#what-is-commitlint',
};

module.exports = Configuration;
