import React, { useState } from 'react';
import { RequestType } from '../enums'; // Import the enum
import { CustomModal } from './CustomModal';

export const EntryCodeModal = ({ onClose }) => {

  const [entryCode, setEntryCode] = React.useState("")

  return (
    <CustomModal
      title="Enter Entry Code"
      textValue={entryCode}
      onTextInput={(text) => setEntryCode(text)}
      closeText={"Submit"}
      onClose={() => onClose(entryCode)}
    />
  );
};
