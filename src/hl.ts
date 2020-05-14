import hl from 'cli-highlight';

export function highlight(code: string) {
  return hl(code, {
    language: 'javascript',
    ignoreIllegals: true,
  });
}
