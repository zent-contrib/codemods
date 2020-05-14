import hl from 'cli-highlight';

export function highlight(code: string, lang: string) {
  return hl(code, {
    language: lang,
    ignoreIllegals: true,
  });
}
