# Local Branch Cleanup

Welcome to your Local Branch Cleanup project!

Local Branch Cleanup is a command-line interface (CLI) tool to delete unused local branches in a Git repository.

## Installation

You can install the `local-branch-cleanup` CLI tool globally using npm:

```bash
npm install -g local-branch-cleanup
```

## Usage

To clean up unused local branches in your Git repository, run the following command:

<!-- ```bash
lbc
```

This command will interactively guide you through the process of selecting and deleting local branches that have already been merged into the current branch.

You can also exclude specific branches from deletion using the exclude command: -->

```bash
lbc exclude <branchToExclude>
```

Replace ```branchToExclude``` with the name of the branch you want to exclude from deletion.
The default value for ```branchToExclude``` is ```main```.

## Features

* Easily clean up unused local branches.
* Exclude a specific branch from deletion.
* Interactive command-line interface for uncommitted changes.
* Interactive command-line interface for unpushed changes.
<!-- * Interactive command-line interface for branch selection. -->

## Contributing

Contributions are welcome! If you find a bug or have a feature request, please open an issue.

To contribute to this project, follow these steps:

1. Fork this repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them.
4. Push your changes to your fork.
5. Create a pull request to merge your changes into the main repository.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

* simple-git - A Git library for Node.js.

## Author

* [**Durmus Demirtas**](https://github.com/demirtasdurmus)

## Contact

* **Email**: <demirtasdurmus@gmail.com>
