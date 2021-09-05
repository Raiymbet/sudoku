module.exports = function solveSudoku(matrix) {
  // your solution
  const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  let isSolved = (sudoku) => {
    for (let i = 0; i < 9; i++) {
      let [r,c] = [Math.floor(i/3)*3,(i%3)*3];
      if (
          (sudoku[i].reduce((s,v)=>(s.delete(v), s), new Set(DIGITS)).size != 0) ||
          (sudoku.reduce((s,v)=>(s.delete(v[i]), s), new Set(DIGITS)).size != 0) ||
          (sudoku.slice(r,r+3).reduce((s,v)=>v.slice(c,c+3).reduce((s,v)=>(s.delete(v), s), s), new Set(DIGITS)).size != 0)
        ) return false;
    }

    return true;
  }

  let get_empty_spots = (matrix) => {
    let empty_spots = [];
    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < matrix[i].length; j++) {
        if (matrix[i][j] === 0 || Array.isArray(matrix[i][j])) {
          empty_spots.push([i, j]);
        }
      }
    }
    return empty_spots;
  }

  let get_row = (matrix, rowIndex) => {
    return matrix[rowIndex];
  }

  let get_column = (matrix, colIndex) => {
    let cols = [];
    for (let i = 0; i < matrix.length; i++) {
      cols.push(matrix[i][colIndex]);
    }
    
    return cols;
  }

  let get_square = (matrix, rowIndex, colIndex) => {
    let square = [],
        squareRow = Math.floor(rowIndex / 3) * 3,
        squareCol = Math.floor(colIndex / 3) * 3;

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        square.push(matrix[squareRow + i][squareCol + j]);
      }
    }

    return square;
  }

  let get_all_possible_values = (matrix, rowIndex, colIndex) => {
    let possible_values = [],
        row_values = get_row(matrix, rowIndex),
        col_values = get_column(matrix, colIndex),
        square_values = get_square(matrix, rowIndex, colIndex);
    for (let i = 1; i <= 9; i++) {
      if (!row_values.includes(i) &&
          !col_values.includes(i) &&
          !square_values.includes(i)) {
        possible_values.push(i);
      }
    }

    return possible_values;
  }

  let fill_possible_spots = (matrix, empty_spots) => {
    let spot_index = 0;
    while (spot_index < empty_spots.length) {
      let possible_values = get_all_possible_values(matrix, empty_spots[spot_index][0], empty_spots[spot_index][1]);
      if (possible_values.length === 1) {
        fill_spot_value(matrix, empty_spots[spot_index][0], empty_spots[spot_index][1], possible_values[0]);
        spot_index = -1;
      } else {
        matrix[empty_spots[spot_index][0]][empty_spots[spot_index][1]] = possible_values;
      }
  
      spot_index++;
    }
  }

  let fill_spot_value = (matrix, rowIndex, colIndex, value) => {
    let spot_index = empty_spots.findIndex(s => s[0] == rowIndex && s[1] == colIndex);
    matrix[rowIndex][colIndex] = value;
    empty_spots.splice(spot_index, 1);
    extract_value_from_row_col_square(matrix, rowIndex, colIndex);
  }

  let extract_value_from_row_col_square = (matrix, rowIndex, colIndex) => {
    // Value delete from row and column
    for (let i = 0; i < matrix.length; i++) {
      // delete from row
      if (Array.isArray(matrix[rowIndex][i]) && 
          matrix[rowIndex][i].includes(matrix[rowIndex][colIndex])) {
            matrix[rowIndex][i] = matrix[rowIndex][i].filter(v => v != matrix[rowIndex][colIndex]);
            if (matrix[rowIndex][i].length === 1) {
              fill_spot_value(matrix, rowIndex, i, matrix[rowIndex][i][0]);
            }
      }
      // delete from coloumn
      if (Array.isArray(matrix[i][colIndex]) && 
          matrix[i][colIndex].includes(matrix[rowIndex][colIndex])) {
            matrix[i][colIndex] = matrix[i][colIndex].filter(v => v != matrix[rowIndex][colIndex]);
            if (matrix[i][colIndex].length === 1) {
              fill_spot_value(matrix, i, colIndex, matrix[i][colIndex][0]);
            }
      }
    }

    // Value delete from block
    let squareRow = Math.floor(rowIndex / 3) * 3, 
        squareCol = Math.floor(colIndex / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (Array.isArray([squareRow + i][squareCol + j]) && 
            matrix[squareRow + i][squareCol + j].includes(matrix[rowIndex][colIndex])) {
              matrix[squareRow + i][squareCol + j] = matrix[squareRow + i][squareCol + j].filter(v => v != matrix[rowIndex][colIndex]);
              if (matrix[squareRow + i][squareCol + j].length === 1) {
                fill_spot_value(matrix, (squareRow + i), (squareCol + j), matrix[squareRow + i][squareCol + j][0]);
              }
        }
      }
    }
  }
  

  let minimize_possible_values = (matrix, empty_spots) => {

    let changed = false;

    for (let spot_index = 0; spot_index < empty_spots.length; spot_index++) {
      let rowIndex = empty_spots[spot_index][0],
          colIndex = empty_spots[spot_index][1],
          squareRow = Math.floor(rowIndex / 3) * 3,
          squareCol = Math.floor(colIndex / 3) * 3;

      let  square_values = get_square(matrix, rowIndex, colIndex);

      // Find equal possible values in block
      let possible_value_length = matrix[rowIndex][colIndex].length, 
          finded_length = square_values.filter(v => Array.isArray(v) && JSON.stringify(v) === JSON.stringify(matrix[rowIndex][colIndex])).length;
      if (possible_value_length === finded_length) {
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            if (Array.isArray(matrix[squareRow + i][squareCol + j]) && 
                JSON.stringify(matrix[squareRow + i][squareCol + j]) != JSON.stringify(matrix[rowIndex][colIndex])) {
                  matrix[squareRow + i][squareCol + j] = matrix[squareRow + i][squareCol + j].filter(v => !matrix[rowIndex][colIndex].includes(v));
                  if (matrix[squareRow + i][squareCol + j].length == 1) {
                    fill_spot_value(matrix, (squareRow + i), (squareCol + j), matrix[squareRow + i][squareCol + j][0]);
                    spot_index = 0;
                    changed = true;
                  }
            }
          }
        }
      }
    }

    for (let spot_index = 0; spot_index < empty_spots.length; spot_index++) {
      let rowIndex = empty_spots[spot_index][0],
          colIndex = empty_spots[spot_index][1];

      let row_values = get_row(matrix, rowIndex);

      // Find equal possible values in row
      let possible_value_length = matrix[rowIndex][colIndex].length, 
          finded_length = row_values.filter(v => Array.isArray(v) && JSON.stringify(v) === JSON.stringify(matrix[rowIndex][colIndex])).length;
      if (possible_value_length === finded_length) {
        for (let j = 0; j < 9; j++) {
          if (Array.isArray(matrix[rowIndex][j]) && JSON.stringify(matrix[rowIndex][j]) != JSON.stringify(matrix[rowIndex][colIndex])) {
            matrix[rowIndex][j] = matrix[rowIndex][j].filter(v => !matrix[rowIndex][colIndex].includes(v));
            if (matrix[rowIndex][j].length === 1) {
              fill_spot_value(matrix, rowIndex, j, matrix[rowIndex][j][0]);
              spot_index = 0;
              changed = true;
            }
          }
        }
      }
    }


    for (let spot_index = 0; spot_index < empty_spots.length; spot_index++) {
      let rowIndex = empty_spots[spot_index][0],
          colIndex = empty_spots[spot_index][1];

      let col_values = get_column(matrix, colIndex);

      // Find equal possible values in column
      let possible_value_length = matrix[rowIndex][colIndex].length, 
          finded_length = col_values.filter(v => Array.isArray(v) && JSON.stringify(v) === JSON.stringify(matrix[rowIndex][colIndex])).length;
      if (possible_value_length === finded_length) {
        for (let i = 0; i < 9; i++) {
          if (Array.isArray(matrix[i][colIndex]) && JSON.stringify(matrix[i][colIndex]) != JSON.stringify(matrix[rowIndex][colIndex])) {
            matrix[i][colIndex] = matrix[i][colIndex].filter(v => !matrix[rowIndex][colIndex].includes(v));
            if (matrix[i][colIndex].length === 1) {
              fill_spot_value(matrix, i, colIndex, matrix[i][colIndex][0]);
              spot_index = 0;
              changed = true;
            }
          }
        }
      }
    }


    // Find only one value in possible values by rows
    for (let i = 0; i < matrix.length; i++) {
      let row_values = get_row(matrix, i);
      for (let j = 0; j < row_values.length; j++) {
        if (Array.isArray(row_values[j])) {
          row_values[j].forEach(element => {
            if (row_values.filter(v => Array.isArray(v) && v.includes(element)).length === 1 ) {
              fill_spot_value(matrix, i, row_values.findIndex(v => JSON.stringify(v) === JSON.stringify(row_values[j])), element);
              changed = true;
            }
          });
        }
      }
    }

    return changed;
  }

  var empty_spots = get_empty_spots(matrix);
  console.log("Empty spots: ", empty_spots.join(' | '));
  fill_possible_spots(matrix, empty_spots);

  // 
  let counter = 0;
  while (empty_spots.length) {
    if (counter > 1000) {
      break;
    }
    
    let changed = minimize_possible_values(matrix, empty_spots);
    if(!changed) {
      let clone_matrix = [...matrix],
          clone_empty_spots = [...empty_spots];
      
      for (let i = 0; i < matrix[empty_spots[0][0]][empty_spots[0][1]].length; i++) {
        fill_spot_value(matrix, empty_spots[0][0], empty_spots[0][1], matrix[empty_spots[0][0]][empty_spots[0][1]][i]);
        matrix = solveSudoku(clone_matrix);
        empty_spots = get_empty_spots(matrix);
        if (empty_spots.length === 0 && isSolved(matrix)) {
          break;
        } else {
          matrix = [...clone_matrix];
          empty_spots = [...clone_empty_spots];
        }
      }
    }

    counter++;
  }
  

  console.table(matrix);
  return matrix;
  
}
