import { Drawer, Input } from 'antd';
import * as React from 'react';

export function SettingsDrawer(props: {
  showSettings: boolean;
  apiURL: string | undefined;
  freshbookToken: string | undefined;
  onSettingsClose: () => void;
  onSettingsChange: (
    localStorageKey: string,
    value: string | undefined
  ) => void;
}) {
  return (
    <Drawer
      title="Settings"
      placement="right"
      closable
      onClose={props.onSettingsClose}
      visible={props.showSettings}
      width={500}
    >
      <Input
        value={props.apiURL}
        key="apiUrlInputKey"
        onChange={e => {
          props.onSettingsChange('apiURL', e.target.value);
        }}
        addonBefore="API URL"
      />
      <br />
      <br />
      <Input
        key="tokenInputKey"
        value={props.freshbookToken}
        onChange={e => {
          props.onSettingsChange('freshbookToken', e.target.value);
        }}
        addonBefore="Authentication Token"
      />
    </Drawer>
  );
}
