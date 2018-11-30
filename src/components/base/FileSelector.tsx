import React, { Component } from 'react';
import styled from 'styled-components';
import uniqueId from 'lodash/uniqueId';

type FileType = {
  file: string;
  name: string;
  type: string;
  id: string;
};

interface PropsType {
  files: FileType[];
  onFileClick: (file: FileType) => void;
  onFileAdd: (
    {
      file,
      onComplete,
      onError
    }: {
      file: {
        file: File;
        tempId: string;
      };
      onComplete: (file: FileType) => void;
      onError: (fileId: string) => void;
    }
  ) => void;
  onFileRemove: (file: FileType) => void;
  onFormChange: (newFiles: FileType[]) => void;
}

const StyledFileName = styled.div`
  cursor: pointer;
  display: inline-block;
  margin-right: 10px;
`;
const StyledRemove = styled.span`
  cursor: pointer;
  display: inline-block;
`;

class FileSelector extends Component<PropsType> {
  onComplete = (file: FileType) => {
    this.props.onFormChange([...this.props.files, file]);
  };
  onError = (tempId: string) => {};
  onFileAdd = (file: { file: File; tempId: string }) => {
    this.props.onFileAdd({
      file,
      onComplete: this.onComplete,
      onError: this.onError
    });
  };

  handleFileRemove = (file: FileType) => {
    this.props.onFileRemove(file);

    const newFiles = this.props.files.filter(
      existingFile => existingFile.id !== file.id
    );
    this.props.onFormChange(newFiles);
  };

  handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const files = event.target.files;
    if (files)
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        this.onFileAdd({
          file: file,
          tempId: uniqueId('temp_')
        });
      }
    event.target.value = '';
  };

  render() {
    const { files } = this.props;

    return (
      <>
        <div>
          {files.map(file => (
            <div>
              <StyledFileName
                key={`fileName-${file.id}`}
                onClick={() => this.props.onFileClick(file)}
              >
                {file.name}
              </StyledFileName>
              <StyledRemove
                key={`remove-${file.id}`}
                onClick={() => this.handleFileRemove(file)}
              >
                Remove
              </StyledRemove>
            </div>
          ))}
        </div>
        <input type="file" onChange={this.handleFileInput} multiple />
      </>
    );
  }
}

export default FileSelector;