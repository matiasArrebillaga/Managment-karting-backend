import type { Config } from "jest";

const config: Config = {
    preset: "ts-jest",
    testEnvironment: "node",
    setupFiles: ["<rootDir>/tests/env.setup.ts"],
    clearMocks: true,
    modulePathIgnorePatterns: ["<rootDir>/dist/"],
    moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
    },
};

export default config;