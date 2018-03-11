import { CLIEngine, Level, LintReport } from "eslint";
import { reportToRuleGroups, ruleGroupsToOverride } from "./ruleGrouping";
import { reportToFileGroup, fileGroupsToOverride } from "./fileGrouping";
import * as fs from "fs";
import * as YAML from "yamljs";
import * as _ from "lodash";

function loadYAML<T = any>(path: string): T {
  return YAML.parse(fs.readFileSync(path, "utf8"));
}

function outputToYaml(object: any): string {
  return YAML.stringify(object, 10, 2);
}

function getNewConfig(baseConfig: any): any {
  const newExtend = _.uniq([".eslintrc-todo.yml", ...baseConfig.extends]).reverse();
  return {
    ...baseConfig,
    extends: newExtend,
  };
}

export const execute = (level: Level) => {
  const newLint = new CLIEngine({
    allowInlineConfig: false,
  });
  const result = newLint.executeOnFiles(["."]) as LintReport;
  const baseTransformation = reportToFileGroup(result);
  const overrides = fileGroupsToOverride(baseTransformation, level);
  const baseConfig = loadYAML(".eslintrc.yml");
  const updatedBaseConfig = getNewConfig(baseConfig);
  const updatedBaseYAML = outputToYaml(updatedBaseConfig);
  const newToDoListConfig = outputToYaml({ overrides });
  fs.writeFileSync(".eslintrc-todo.yml", newToDoListConfig, { encoding: "utf8" });
  fs.writeFileSync(".eslintrc.yml", updatedBaseYAML, { encoding: "utf-8" });
};
