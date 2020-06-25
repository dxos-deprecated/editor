
import React, { useCallback } from 'react';

import TextField from '@material-ui/core/TextField';

import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';

// import TextField from '@material-ui/core/TextField';

const options = [
  '8', '9', '10', '11', '12', '14', '18', '24', '30', '36', '48', '60', '72', '96'
];

export default ({ initialValue = '11', onSelect, onCancel }) => {
  const [value, setValue] = React.useState(initialValue);
  const [inputValue, setInputValue] = React.useState('');

  const handleInputChange = useCallback((event, value) => {
    setInputValue(value);
  }, [setInputValue]);

  const handleChange = useCallback((event, value) => {
    if (Number.isNaN(Number.parseFloat(value))) {
      return onCancel();
    }

    return onSelect(Number.parseFloat(value));
  }, [setValue]);

  const handleFilterOptions = useCallback((options, params) => {
    const filtered = createFilterOptions()(options, params);

    // Suggest the creation of a new value
    if (filtered.length === 0 && params.inputValue !== '') {
      filtered.push(params.inputValue);
    }

    console.log(filtered, params);

    return filtered;
  });

  // const handleGetOptionLabel = useCallback(option => {
  //   // Value selected with enter, right from the input
  //   if (typeof option === 'string') {
  //     return option;
  //   }
  //   // Add "xxx" option created dynamically
  //   if (option.inputValue) {
  //     return option.inputValue;
  //   }
  //   // Regular option
  //   return option.title;
  // }, []);

  return (
    <Autocomplete
      inputValue={inputValue}
      value={value}
      onChange={handleChange}
      onInputChange={handleInputChange}
      options={options}
      // getOptionLabel={handleGetOptionLabel}
      filterOptions={handleFilterOptions}
      renderInput={(params) => <TextField {...params} label='Controllable' variant='outlined' />}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      freeSolo
    />
  );
};
