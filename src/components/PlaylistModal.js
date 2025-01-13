import React, { useState } from 'react';
import { RequestType } from '../enums'; // Import the enum
import { CustomModal } from './CustomModal';

export const PlaylistModal = ({ onClose }) => {

  const [playlistName, setPlaylistName] = React.useState("")

  return (
    <CustomModal
    title="New Playlist"
    body="Enter a name for the new playlist"
    isInputVisible={true}
    handleRequest={() => {
      if (textValue.trim()) {
        addDanceToPlaylist(dance, textValue.trim());
      }
      setModal(null);
    }}
    onClose={() => {onClose(playlistName)}}
      textValue={playlistName}
    onTextInput={setPlaylistName}
    closeText={"Done"}
  />
  );
};
