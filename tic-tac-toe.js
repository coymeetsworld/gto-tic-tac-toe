
$(document).ready(function() {
  //$('#myModalChooseSide').modal('show');

  var playerMark = '';
  var opponentMark = '';
  var board = ['', '', '', '', '', '', '', '', ''];


  runCountAB = 0; // Used to show how many moves run including Alpha-Beta Pruning
  function miniMaxWithABPruning(depth, board, isMaximizingPlayer, alpha, beta) {
    runCountAB++;

    if (checkForWinner(opponentMark, board, true)) {
      return 10 - depth;
    }
    else if (checkForWinner(playerMark, board, true)) {
      return -10 + depth;
    }

    var bestValue, bestMove, player;
    if (isMaximizingPlayer) {
      bestValue = Number.NEGATIVE_INFINITY;
      // Opponent only uses this algorithm, so the maximizing player is opponent mark.
      player = opponentMark;
    } else {
      bestValue = Number.POSITIVE_INFINITY;
      player = playerMark;
    }
    for (var i = 0; i < board.length; i++) {
      if (board[i] == '') {
        board[i] = player; //whoevers turn it is.

        if (isMaximizingPlayer) {
          alpha = miniMaxWithABPruning(depth+1, board, !isMaximizingPlayer, alpha, beta);
          board[i] = ''; // remove test move from actual board.

          if (bestValue < alpha) {
            bestValue = alpha;
            bestMove = i;
          }

          if (alpha >= beta) {
            break; // Prune
          }

        } else {
          beta = miniMaxWithABPruning(depth+1, board, !isMaximizingPlayer, alpha, beta);
          board[i] = ''; // remove test move from actual board.
          if (bestValue > beta) {
            bestValue = beta;
            bestMove = i;
          }

          if (alpha >= beta) {
            break; // Prune
          }
        }
      }
    }

    if (depth == 0) {
      if (isMaximizingPlayer && bestValue == Number.NEGATIVE_INFINITY || !isMaximizingPlayer && bestValue == Number.POSITIVE_INFINITY) {
        return board.indexOf(''); // no good or bad moves, just choose first blank spot available.
      }
      return bestMove;
    }

    if (isMaximizingPlayer && bestValue == Number.NEGATIVE_INFINITY || !isMaximizingPlayer && bestValue == Number.POSITIVE_INFINITY) { //but not depth == 0
      return 0;
    }

    return bestValue;
  }


  runCount = 0; // Used to show how many moves run w/o optimizations
  /* Function is with respect to opponent. */
  function miniMax(depth, board, isMaximizingPlayer) {
    runCount++;

    if (checkForWinner(opponentMark, board, true)) {
      return 10 - depth;
    }
    else if (checkForWinner(playerMark, board, true)) {
      return -10 + depth;
    }

    var bestValue, bestMove, player;
    if (isMaximizingPlayer) {
      bestValue = Number.NEGATIVE_INFINITY;
      // Opponent only uses this algorithm, so the maximizing player is opponent mark.
      player = opponentMark;
    } else {
      bestValue = Number.POSITIVE_INFINITY;
      player = playerMark;
    }
    for (var i = 0; i < board.length; i++) {
      if (board[i] == '') {
        board[i] = player; //whoevers turn it is.
        var val = miniMax(depth+1, board, !isMaximizingPlayer);
        if (isMaximizingPlayer && bestValue < val) {
          bestValue = val;
          bestMove = i;
        } else if (!isMaximizingPlayer && bestValue > val) {
          bestValue = val;
          bestMove = i;
        }
        board[i] = ''; //reset board value as this is just testing for values.
      }
    }

    if (depth == 0) {
      if (isMaximizingPlayer && bestValue == Number.NEGATIVE_INFINITY || !isMaximizingPlayer && bestValue == Number.POSITIVE_INFINITY) {
        // no good or bad moves?
        return board.indexOf(''); // Just choose first blank spot you see.
      }
      return bestMove;
    }

    if (isMaximizingPlayer && bestValue == Number.NEGATIVE_INFINITY || !isMaximizingPlayer && bestValue == Number.POSITIVE_INFINITY) {
      //but not depth == 0
      return 0;
    }

    return bestValue;
  }

  $("#btn-choose-x").click(function() {
    playerMark = 'X';
    opponentMark = 'O';
    resetGame();
  });
  $("#btn-choose-o").click(function() {
    playerMark = 'O';
    opponentMark = 'X';
    resetGame();
    opponentTurn();
  });

  $(".btn-reset").click(function() {
    resetGame();
    if (playerMark == 'O') {
      opponentTurn();
    }
  });

  function resetGame() {
    enableCells();
    $("#grid td").html('');
    board = ['', '', '', '', '', '', '', '', ''];
    $("#winningLine").remove();
  }


  function opponentTurn() {
    //var move = miniMax(0, board, true);  // need to set opponent as minimizing player
    //console.log("Number of times minmax run: " + runCount);

    var move = miniMaxWithABPruning(0, board, true, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);  // need to set opponent as minimizing player
    console.log("Number of times minmax run: " + runCountAB);

    runCount = 0;
    runCountAB = 0;
    var cellClass = "#cell" + (parseInt(move) + 1);
    board[move] = opponentMark;
    $(cellClass).html(opponentMark);
    var foundWinner = checkForWinner(opponentMark, board, false);
    if(foundWinner) {
      disableCells();
      $('#myModalLose').modal('show');
    } else if (checkForDraw()) {
      disableCells();
      $('#myModalDraw').modal('show');
    }
  }


  function clickAction(event) {
    var cellID = event.data.param1;
    var boardIndex = event.data.param2;
    if($(cellID).text() == '' || $(cellID).html() == '<p class="hoverMove">' + playerMark + "</p>") {
      $(cellID).html(playerMark);
      board[boardIndex] = playerMark;
      // Not checking for winner, because player should be unable to win.
      if (checkForDraw()) {
        disableCells();
        $('#myModalDraw').modal('show');
      }
      opponentTurn();
    }
  }

  function mouseEnterCellAction(event) {
    var cellID = event.data.param1;
    if ($(cellID).text() == '') {
      $(cellID).html("<p class='hoverMove'>" + playerMark + "</p>");
    }
  }

  function mouseLeaveCellAction(event) {
    var cellID = event.data.param1;
    if ($(cellID).html() == '<p class="hoverMove">' + playerMark + "</p>") {
      $(cellID).html('');
    }
  }

  /* Called after a player wins, don't allow user input anymore. */
  function disableCells() {
    for (var i = 1; i <= board.length; i++) {
      $("#cell" + i).unbind("click");
      $("#cell" + i).unbind("mouseenter");
      $("#cell" + i).unbind("mouseleave");
    }
  }

  function enableCells() {
    for (var i = 0; i < board.length; i++) {
      var cellID = "#cell" + (i + 1);
      $(cellID).click({param1: cellID, param2: i}, clickAction);
      $(cellID).mouseenter({param1: cellID}, mouseEnterCellAction);
      $(cellID).mouseleave({param1: cellID}, mouseLeaveCellAction);
    }
  }

  /* Called after checkForWinner. */
  function checkForDraw() {
    for (var i = 0; i < board.length; i++) {
      if (board[i] == '') {
        return false;
      }
    }
    return true;
  }


  /* Checks if there is a winning state. Returns 0 if no winning state, returns an integer that maps to the line that needs to be drawn if true. */
  function checkForWinner(player, board, isSimulation) {

    /* If players have not been selected, there can't be a winner. */
    if (player == '') { return false; }

  	if (board[0] == player && board[0] == board[1] && board[0] == board[2]) {
      if (!isSimulation) { drawWinSlash(0,2); }
  		return true;
  	}
  	else if (board[0] == player && board[0] == board[4] && board[0] == board[8]) {
      if (!isSimulation) { drawWinSlash(0,8); }
  		return true;
  	}
  	else if (board[0] == player && board[0] == board[3] && board[0] == board[6]) {
      if (!isSimulation) { drawWinSlash(0,6); }
  		return true;
  	}
  	else if (board[1] == player && board[1] == board[4] && board[1] == board[7]) {
      if (!isSimulation) { drawWinSlash(1,7); }
  		return true;
  	}
  	else if (board[2] == player && board[2] == board[4] && board[2] == board[6]) {
      if (!isSimulation) { drawWinSlash(2,6); }
  		return true;
  	}
  	else if (board[2] == player && board[2] == board[5] && board[2] == board[8]) {
      if (!isSimulation) { drawWinSlash(2,8); }
  		return true;
  	}
  	else if (board[3] == player && board[3] == board[4] && board[3] == board[5]) {
      if (!isSimulation) { drawWinSlash(3,5); }
  		return true;
  	}
  	else if (board[6] == player && board[6] == board[7] && board[6] == board[8]) {
      if (!isSimulation) { drawWinSlash(6,8); }
  		return true;
  	}
  	return false;
  }

  $("#btn-showboard").click(function() {
    printBoard(board);
  });


  /* Called by drawWin to make a line to show 3 in a row. */
  function buildLine(cx, cy, thickness, length, angle) {
    var lineDiv = $("<div>");
    lineDiv.attr('id', 'winningLine');
    lineDiv.css('height', thickness + 'px');
    lineDiv.css('left', cx + 'px');
    lineDiv.css('top', cy + 'px');
    lineDiv.css('width', length + 'px');
    lineDiv.css('-moz-transform', 'rotate(' + angle + 'deg)');
    lineDiv.css('-webkit-transform', 'rotate(' + angle + 'deg)');
    lineDiv.css('-moz-transform', 'rotate(' + angle + 'deg)');
    lineDiv.css('-o-transform', 'rotate(' + angle + 'deg)');
    lineDiv.css('-ms-transform', 'rotate(' + angle + 'deg)');
    lineDiv.css('transform', 'rotate(' + angle + 'deg)');
    return lineDiv;
  }

  function drawWinSlash(cellANum, cellBNum) {
    var thickness = 5;
    var color = "red";
    var divA = $("#cell" + (cellANum+1));
    var divB = $("#cell" + (cellBNum+1));
    var ax, ay, bx, by;

    if (cellANum == 0 && cellBNum == 2 || cellANum == 3 && cellBNum == 5 || cellANum == 6 && cellBNum == 8) {
      // Horizontal lines
      ax = divA.offset().left-50;
      ay = divA.offset().top + divA.height()/2;
      bx = divB.offset().left + divB.width()+50;
      by = divB.offset().top + divB.height()/2;
    } else if (cellANum == 0 && cellBNum == 6 || cellANum == 1 && cellBNum == 7 || cellANum == 2 && cellBNum == 8) {
      // Vertical lines
      ax = divA.offset().left + divA.width()/2;
      ay = divA.offset().top - 50;
      bx = divB.offset().left + divB.width()/2;
      by = divB.offset().top + divB.height() + 50;

    } else if (cellANum == 0 && cellBNum == 8) {
      //Diagonal top-left -> bottom-right
      ax = divA.offset().left - 20;
      ay = divA.offset().top - 20;
      bx = divB.offset().left + divB.width()+20;
      by = divB.offset().top + divB.height() + 20;

    } else if (cellANum == 2 && cellBNum == 6) {
      //Diagonal top-right to bottom-left
      ax = divA.offset().left + divA.width() + 20;
      ay = divA.offset().top - 20;
      bx = divB.offset().left - 20;
      by = divB.offset().top + divB.height() + 20;
    }

    var angle = angle = Math.atan2((ay-by),(ax-bx))*(180/Math.PI);

    var length = Math.sqrt(((bx-ax) * (bx-ax)) + ((by-ay) * (by-ay)));
    //center coordinates.
    var cx = ((ax + bx) / 2) - (length / 2);
    var cy = ((ay + by) / 2) - (thickness / 2);

    var lineDiv = buildLine(cx, cy, thickness, length, angle);
    console.log("Called line");
    $("body").append(lineDiv);
  }

  /* Redrawing the winner line if window resizes. */
  $(window).resize(function() {
    console.log("Window resized");
    $("#winningLine").remove();
    checkForWinner(opponentMark, board, false);
  });

  /* Debugging function, used to print out board status. */
  function printBoard(board) {
      console.log("");
      console.log("");
    	console.log(board[0] + " | " + board[1] + " | " + board[2]);
    	console.log("-----------");
    	console.log(board[3] + " | " + board[4] + " | " + board[5]);
    	console.log("-----------");
    	console.log(board[6] + " | " + board[7] + " | " + board[8]);
  }

});
