import React from 'react';
import defaultClasses from './Key.module.scss';

export function Key({
  children,
  classes
}: {
  children: string;
  classes?: Record<string, string>;
}) {
  const classNames: Record<string, string> = { ...defaultClasses, ...classes };
  return <span className={classNames.key}>{children}</span>;
}
