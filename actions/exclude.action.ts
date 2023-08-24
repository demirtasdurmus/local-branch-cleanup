import simpleGit, { BranchSummary, BranchSummaryBranch, FileStatusResult, SimpleGit, StatusResult } from 'simple-git';
import * as chalk from 'chalk';
import * as inquirer from 'inquirer';
import { AbstractAction } from './abstract.action';
import { ICommandInput } from '../commands';

type Branches = {
    [key: string]: BranchSummaryBranch;
};

export class ExcludeAction extends AbstractAction {
    constructor(private readonly git: SimpleGit = simpleGit()) {
        super();
    }

    public async handle(inputs: ICommandInput[], _options: ICommandInput[], _extraFlags: string[]): Promise<void> {
        const currentBranchStatus = await this.getBranchStatus();

        const branchToKeep = this.getBranchToKeepName(inputs);

        const localBranchSummary = await this.getLocalBranchSummary();

        // required for scenarios where a git repo is initialized but no commits have been made
        this.areThereLocalBranches(localBranchSummary.branches);

        this.doesBranchExist(branchToKeep, localBranchSummary.branches);

        const branchesToDelete = this.getBranchesToDelete(branchToKeep, localBranchSummary.branches);

        await this.handleUncommittedChanges(currentBranchStatus.files);

        await this.checkoutToBranchIfNotCurrent(localBranchSummary.current, branchToKeep);

        await this.handleDeleteBranches(branchToKeep, branchesToDelete);
    }

    private doesBranchExist(branch: string, branches: Branches): void {
        if (!branches.hasOwnProperty(branch)) {
            throw new Error(`Branch ${chalk.blue(branch)} does not exist locally`);
        }
    }

    private areThereLocalBranches(branches: Branches): void {
        if (branches === undefined || branches === null || Object.keys(branches).length === 0) {
            throw new Error('No local branches found');
        }
    }

    private getBranchesToDelete(branchToKeep: string, branches: Branches): string[] {
        const branchesToDelete = Object.keys(branches).filter((branch) => branch !== branchToKeep);

        if (branchesToDelete.length === 0) {
            throw new Error(`No branches to delete`);
        }

        return branchesToDelete;
    }

    private getBranchToKeepName(inputs: ICommandInput[]): string {
        const branchToKeepInput: ICommandInput = inputs.find((input) => input.name === 'branchToKeep') as ICommandInput;

        return (branchToKeepInput.value || 'main') as string;
    }

    private outputWarningMessage(message: string): void {
        console.log(chalk.yellow.bold(message));
    }

    private outputSuccessMessage(message: string): void {
        console.log(chalk.green.bold(message));
    }

    private async getBranchStatus(): Promise<StatusResult> {
        return this.git.status();
    }

    private async getLocalBranchSummary(): Promise<BranchSummary> {
        return this.git.branchLocal();
    }

    private async checkoutToBranchIfNotCurrent(current: string, branch: string): Promise<void> {
        // check if the passed branch to keep is the current branch
        if (current !== branch) {
            // if not, checkout to branch to keep
            this.outputWarningMessage(`Checking out to branch ${branch}...`);

            await this.git.checkout(branch);
        }
    }

    private async handleUncommittedChanges(changes: FileStatusResult[]): Promise<void> {
        if (changes.length > 0) {
            this.outputWarningMessage('Current branch has uncommitted changes!');

            const prompt = inquirer.createPromptModule();
            const { action } = await prompt([
                {
                    type: 'list',
                    name: 'action',
                    message: `What do you want to do with them?`,
                    choices: ['delete', 'stash', 'commit'],
                },
            ]);

            switch (action) {
                case 'delete':
                    await this.handleDeleteChanges();
                    break;
                case 'stash':
                    await this.handleStashChanges();
                    break;
                case 'commit':
                    await this.handleCommitChanges();
                    break;
                default:
                    break;
            }
        }
    }

    private async handleDeleteChanges(): Promise<void> {
        this.outputWarningMessage('Deleting/Discarding uncommitted changes...');

        await this.git.reset(['--']);
        await this.git.clean('f');
        await this.git.checkout(['--', '.']);
    }

    private async handleStashChanges(): Promise<void> {
        // prompt user for stash message
        const prompt = inquirer.createPromptModule();
        const { stashMessage } = await prompt([
            {
                type: 'input',
                name: 'stashMessage',
                message: 'Enter stash message:',
            },
        ]);

        this.outputWarningMessage('Stashing uncommitted changes...');

        await this.git.add('.');
        await this.git.stash(['save', stashMessage]);
    }

    private async handleCommitChanges(): Promise<void> {
        // prompt user for commit message
        const prompt = inquirer.createPromptModule();
        const { commitMessage } = await prompt([
            {
                type: 'input',
                name: 'commitMessage',
                message: 'Enter commit message:',
            },
        ]);

        this.outputWarningMessage('Committing changes...');

        await this.git.add('.');
        await this.git.commit(commitMessage);
    }

    private async handleDeleteBranches(branchToKeep: string, branchesToDelete: string[]): Promise<void> {
        for (const branch of branchesToDelete) {
            // colorize branch name
            const coloredBranch = chalk.blue.bold(branch);

            try {
                await this.git.deleteLocalBranch(branch);

                this.outputSuccessMessage(`Deleted branch ${coloredBranch}!`);
            } catch (error) {
                if (error.message.includes('not fully merged')) {
                    this.outputWarningMessage(`Branch ${coloredBranch} has unmerged changes...`);

                    // prompt user to decide the next action: abort, continue, undo commit, push changes and delete
                    const prompt = inquirer.createPromptModule();
                    const { action } = await prompt([
                        {
                            type: 'list',
                            name: 'action',
                            message: `What do you want to do with branch ${coloredBranch}?`,
                            choices: ['abort-deletion', 'continue-deletion', 'undo-commit', 'push-changes-and-delete'],
                        },
                    ]);

                    if (action === 'abort-deletion') {
                        this.outputSuccessMessage(`Aborted deletion for branch ${coloredBranch}!`);
                        continue;
                    }

                    if (action === 'continue-deletion') {
                        await this.git.deleteLocalBranch(branch, true);

                        this.outputSuccessMessage(`Deleted branch ${coloredBranch}!`);
                        continue;
                    }

                    if (action === 'undo-commit') {
                        await this.git.checkout(branch);

                        // prompt the user to select the base branch
                        const prompt1 = inquirer.createPromptModule();
                        const baseBranchChoices = [branchToKeep, ...branchesToDelete];
                        baseBranchChoices.splice(baseBranchChoices.indexOf(branch), 1);
                        const { baseBranch } = await prompt1([
                            {
                                type: 'list',
                                name: 'baseBranch',
                                message: `Select the base branch to compare ${coloredBranch} with:`,
                                choices: baseBranchChoices,
                            },
                        ]);

                        // Get the commit hash of the common ancestor
                        const commonAncestor = await this.git.raw(['merge-base', branch, baseBranch]);

                        // Reset the branch to the common ancestor
                        await this.git.raw(['reset', '--soft', commonAncestor.trim()]);

                        this.outputSuccessMessage(`The commits are undone for branch ${coloredBranch}!`);

                        // prompt user to decide the next action for uncommitted changes: delete, stash, commit
                        const prompt2 = inquirer.createPromptModule();
                        const { action } = await prompt2([
                            {
                                type: 'list',
                                name: 'action',
                                message: `What do you want to do with uncommitted changes?`,
                                choices: ['delete', 'stash'],
                            },
                        ]);

                        switch (action) {
                            case 'delete':
                                await this.handleDeleteChanges();
                                break;
                            case 'stash':
                                await this.handleStashChanges();
                                break;
                            default:
                                break;
                        }

                        await this.git.checkout(branchToKeep);
                        await this.git.deleteLocalBranch(branch, true);

                        this.outputSuccessMessage(`Deleted branch ${coloredBranch}!`);
                        continue;
                    }

                    if (action === 'push-changes-and-delete') {
                        this.outputWarningMessage(`Pushing changes to branch ${coloredBranch}...`);

                        await this.git.checkout(branch);
                        await this.git.push('origin', branch);
                        await this.git.checkout(branchToKeep);
                        await this.git.deleteLocalBranch(branch, true);

                        this.outputSuccessMessage(`Deleted branch ${coloredBranch}!`);
                        continue;
                    }
                } else {
                    throw error;
                }
            }
        }
    }
}
