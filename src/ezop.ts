export type Definition = { type?: "flag" | "list" | "bit" | "level", alias?: string; };
export type Definitions = { [name: string]: Definition | string };
export type Settings = { [name: string]: Definition };

export interface Options {
  args: string[];
  flags: { [name: string]: string };
  bits: { [name: string]: boolean };
  lists: { [name: string]: string[] };
  levels: { [name: string]: number };
  raw: string[];
}

export default function parse(argv: string[], definitions: Definitions = {}): Options {
  const settings = getSettings(definitions);
  const options: Options = { args: [], flags: {}, bits: {}, lists: {}, levels: {}, raw: [] };
  for (const key in settings) {
    switch (settings[key].type) {
      case "bit": options.bits[key] = false; break;
      case "level": options.levels[key] = 0; break;
      case "list": options.lists[key] = []; break;
    }
  }
  for (let a = 0; a < argv.length; a++) {
    const arg = argv[a];
    if (arg === "--") {
      options.raw = argv.slice(a + 1);
      break;
    }
    else if (arg.startsWith("--")) {
      const name = kebabToCamel(arg.substring(2));
      const type = settings[name] ? settings[name].type : undefined
      set(name, type, false);
    }
    else if (arg.startsWith("-") && arg.length == 2) {
      const letter = arg[1];
      const [name, type] = findByAlias(settings, letter);
      set(name, type, true);
    }
    else if (arg.startsWith("-") && arg.length > 2) {
      const letters = arg.substring(1).split("");
      for (const letter of letters) {
        const [name, type] = findByAlias(settings, letter);
        if (type === undefined) {
          options.bits[name] = true;
          options.levels[name] = (options.levels[name] || 0) + 1;
        }
        else if (type === "bit") {
          options.bits[name] = true;
        }
        else if (type === "level") {
          options.levels[name]++;
        }
      }
    }
    else {
      options.args.push(arg);
    }

    function set(name: string, type: string | undefined, single: boolean) {
      if (type === undefined) {
        if (argv[a + 1] && argv[a + 1][0] !== "-") {
          options.flags[name] = argv[++a];
          options.lists[name] = [...(options.lists[name] || []), argv[a]];
        }
        else {
          if (single) {
            options.bits[name] = true;
          }
          else {
            options.flags[name] = "";
          }
        }
      }
      else if (type === "bit") {
        options.bits[name] = true;
      }
      else if (type === "list") {
        options.lists[name].push(argv[++a]);
      }
      else if (type === "level") {
        options.levels[name]++;
      }
    }
  }
  return options;
}

export function flag(alias?: string): Definition { return { type: "flag", alias }; }
export function list(alias?: string): Definition { return { type: "list", alias }; }
export function bit(alias?: string): Definition { return { type: "bit", alias }; }
export function level(alias?: string): Definition { return { type: "level", alias }; }

function findByAlias(settings: Settings, letter: string): [string, string | undefined] {
  const entry = Object.entries(settings).find(([name, { alias }]) => letter === alias);
  const [name, { type }] = entry || [letter, { type: undefined }];
  return [name, type];
}

function getSettings(settings: Definitions): Settings {
  return Object.keys(settings).reduce((set, key) => ({
    ...set,
    [key]: typeof settings[key] === "string" ? { alias: settings[key] } : settings[key]
  }), {});
}

function camelToKebab(camel: string) {
  return camel.replace(/[A-Z]/g, c => "-" + c.toLowerCase());
}

function kebabToCamel(kebab: string) {
  return kebab.replace(/-[a-z]/g, ([, c]) => c.toUpperCase());
}
