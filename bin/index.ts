#!/usr/bin/env node
import { Command } from 'commander';
import { CommandLoader } from '../commands';

const init = async () => {
    const program = new Command();

    program
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        .version(require('../package.json').version, '-v, --version', 'Output the current version.')
        .usage('<command> [options]')
        .helpOption('-h, --help', 'Output usage information.');

    await CommandLoader.load(program);

    program.parseAsync(process.argv);

    if (!process.argv.slice(2).length) {
        program.outputHelp();
    }
};

init();
