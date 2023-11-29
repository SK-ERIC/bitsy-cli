#!/usr/bin/env node
import cac from "cac";
import { version } from "../package.json";
import {
  gitCommit,
  gitCommitVerify,
  cleanup,
  ncu,
  prettierWrite,
  execLintStaged,
  genChangelog,
  release,
} from "./command";
import { loadCliOptions } from "./config";
import type { CliOption } from "./types";

type Command =
  | "git-commit"
  | "git-commit-verify"
  | "cleanup"
  | "ncu"
  | "prettier-write"
  | "lint-staged"
  | "changelog"
  | "release";

type CommandAction<A extends object> = (args?: A) => Promise<void> | void;

type CommandWithAction<A extends object = object> = Record<
  Command,
  { desc: string; action: CommandAction<A> }
>;

interface CommandArg {
  total?: boolean;
}

async function setupCli() {
  const cliOptions = await loadCliOptions();

  const cli = cac("bitsy");

  cli
    .version(version)
    .option("--total", "Generate changelog by total tags")
    .help();

  const commands: CommandWithAction<CommandArg> = {
    cleanup: {
      desc: "delete dirs: node_modules, dist, etc.",
      action: async () => {
        await cleanup(cliOptions.cleanupDirs);
      },
    },
    ncu: {
      desc: "npm-check-updates, it can update package.json dependencies to the latest version",
      action: async () => {
        await ncu(cliOptions.ncuCommandArgs);
      },
    },
    "git-commit": {
      desc: "git commit, generate commit message which match Conventional Commits standard",
      action: async () => {
        await gitCommit(cliOptions.gitCommitTypes, cliOptions.gitCommitScopes);
      },
    },
    "git-commit-verify": {
      desc: "verify git commit message, make sure it match Conventional Commits standard",
      action: async () => {
        await gitCommitVerify();
      },
    },
    "prettier-write": {
      desc: "run prettier --write",
      action: async () => {
        await prettierWrite(cliOptions.prettierWriteGlob);
      },
    },
    "lint-staged": {
      desc: "run lint-staged",
      action: async () => {
        const passed = await execLintStaged(cliOptions.lintStagedConfig).catch(
          () => {
            process.exitCode = 1;
          }
        );

        process.exitCode = passed ? 0 : 1;
      },
    },
    changelog: {
      desc: "generate changelog",
      action: async (args) => {
        await genChangelog(cliOptions.changelogOptions, args?.total);
      },
    },
    release: {
      desc: "release: update version, generate changelog, commit code",
      action: async () => {
        await release();
      },
    },
  };

  for await (const [command, { desc, action }] of Object.entries(commands)) {
    cli.command(command, desc).action(action);
  }

  cli.parse();
}

setupCli();

export type { CliOption };
