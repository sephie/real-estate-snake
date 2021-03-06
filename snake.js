;
var fundaSnake = (function ($) {

  /*
   funda 404 snake
   ---------------
  */

  //

  gameOverTexts = [
      'Woosh - You\'re Dead',
      '<blink>Insert Coin</blink>',
      'Snake? SNAKE? SNAAAAAAKE!',
      'Why did it have to be snakes?',
      'you have been measured and been found wanting',
      'All your base are belong to us',
      'You have died of dysentery',
      'And Here We Go'
  ];


  var ticks = 0;
  var score = 0;
  var GAME_SPEED = 200; //ms between ticks
  var SPEED_INCREMENT = 50; //ms
  var gridSize;
  var gridHeight;
  var gridWidth;

  var nextControlDirection = 'right';
  var currentControlDirection = 'right';

  var growStack = 2; // initial growth
  var SNACK_SIZE = 4;
  var INITIAL_SNACKS = 5;

  var $main = $('#main');
  var $score = $('#score');
  var $intro =  $('div#intro');
  var $gameOver = $('div#game-over');

  var blokjeTemplate = '<div class="blokje"></div>';
  var snackTemplate = '<div class="blokje snack"></div>';

  var snake = [];
  var snacks = [];
  var dead = false;

  function SnakeSegment(element, position, blokjeType) {
    this.position = position || [0, 0]; //[x, y], starting from the top left
    this.$element = element;
    this.$element.css({height: gridSize + 'px', width: gridSize + 'px'});
    this.$element.addClass(blokjeType)
  }

  function startGame() {
    var head;

    console.log('Starting ssssnake!');
    addControlHandlers();

    gridSize = $main.innerWidth() / 48;
    gridHeight = Math.floor($main.innerHeight() / gridSize);
    $main.css('height', gridHeight * gridSize);
    gridWidth = Math.floor($main.innerWidth() / gridSize);

    head = new SnakeSegment($(blokjeTemplate), [4,4], 'head');
    snake.push(head);
    $main.append(head.$element);

    $score.html(score);

    updateSnakeElements();

    for(var j=0 ; j < INITIAL_SNACKS ; j++) {
      placeSnack();
    }

    $intro.hide();
    tick();
  }

  function tick() {
    ticks++;

    if (growStack > 0) {
      growSnake();
    }
    currentControlDirection = nextControlDirection;
    calculateSnakeMovement(currentControlDirection);

    if (!dead) {
      updateSnakeElements(currentControlDirection);
      setTimeout(tick, (GAME_SPEED - Math.floor(score/5) * SPEED_INCREMENT) || 25); //TODO: fix 0 bug
    }
  }


  function growSnake() {
    var lastSegment = snake[snake.length - 1];
    var newSegment = new SnakeSegment($(blokjeTemplate), lastSegment.position, 'snake');

    snake.push(newSegment);
    $main.append(newSegment.$element);
    growStack--;
  }


  function calculateSnakeMovement(direction) {

    var x = snake[0].position[0];
    var y = snake[0].position[1];
    var newHeadPosition;
    var i, nextPosition;

    switch (direction) {
      case 'left':
        x--;
        break;
      case 'up':
        y--;
        break;
      case 'right':
        x++;
        break;
      case 'down':
        y++;
        break;
      default:
        return;
    }


    newHeadPosition = [x, y];
    checkDeath(newHeadPosition);
    checkSnack(newHeadPosition);

    //overwrite position of tail with preceding position, ending with the new pos for head
    for (i = snake.length - 1 ; i >= 1 ; i--) {
      nextPosition = snake[i - 1].position;
      snake[i].position = nextPosition;
    }
    snake[0].position = newHeadPosition;
  }

  function checkDeath(headPosition) {
    var x = headPosition[0];
    var y = headPosition[1];
    if (x < 0 || y < 0 || x >= gridWidth || y >= gridHeight) {
      die();
    }
    snake.forEach(function check(segment) {
      if (segment.position[0] === headPosition[0] && segment.position[1] === headPosition[1]) {
        die();
      }
    });
  }

  function die() {
    dead = true;
    snake.forEach(function check(segment) {
      segment.$element.css('background-color', '#ef4035')
    });

    $gameOver.find('h1').text(gameOverTexts[Math.floor(Math.random() * gameOverTexts.length)]);
    setTimeout(function gameOverDelay() { //TODO temp
      $gameOver.show();
    }, 1000)

  }

  function updateSnakeElements(currentControlDirection) {
    var leaderPos, followerPos, segPos, someDirection;

    snake.forEach(function updateSegment(segment, index) {
      segPos = segment.position;

      if (index === 0 ){
        //head stuff
        someDirection = currentControlDirection;
      } else if (index === (snake.length - 1)) {
        //tail stuff
        leaderPos = snake[index - 1].position;

        snake[index - 1].$element.removeClass('tail');
        segment.$element.addClass('tail');

        if (segPos[0] === leaderPos[0]) {
          //up-down
          someDirection = segPos[1] < leaderPos[1] ? 'down' : 'up';
        } else {
          //left-right
          someDirection = segPos[0] < leaderPos[0] ? 'right' : 'left';
        }
      } else {
        //body stuff
        leaderPos = snake[index - 1].position;
        followerPos = snake[index + 1].position;

        if (segPos[0] === leaderPos[0]) { //leader is above/below me
          if (segPos[0] === followerPos[0]) { //follower also above/below
            someDirection = 'vertical';
          } else if (segPos[1] > leaderPos[1]) { //I'm below the leader, follower must be next to me
            if (segPos[0] > followerPos[0]) {
              someDirection = 'left-up'; //follower is to my left --> UP-LEFT
            } else {
              someDirection = 'right-up'; //follower is to my right --> UP-RIGHT
            }
          } else { //I'm above leader, follower must be next to me
            if (segPos[0] > followerPos[0]) {
              someDirection = 'left-down'; //follower is to my left --> DOWN-LEFT
            } else {
              someDirection = 'right-down'; //follower is to my right --> DOWN-RIGHT
            }
          }
        } else {
          // leader next to me
          if (segPos[1] === followerPos[1]) { //follower also next to me
            someDirection = 'horizontal';
          } else if (segPos[0] > leaderPos[0]) { //leader to my left, follower must be above/below
            if (segPos[1] > followerPos[1]) {
              someDirection = 'left-up';
            } else {
              someDirection = 'left-down';
            }
          } else { //leader to my right, follower must be above/below
            if (segPos[1] > followerPos[1]) {
              someDirection = 'right-up';
            } else {
              someDirection = 'right-down';
            }
          }
        }
      }

      segment.$element.css({
        left: segment.position[0] * gridSize,
        top: segment.position[1] * gridSize
      }).attr('direction', someDirection);
    });
  }

  function placeSnack() {
    var snackPosition;
    var snack;

    while (!snackPosition) {
      snackPosition = findSnackSpace();
    }

    snack = new SnakeSegment($(snackTemplate), snackPosition);
    snacks.push(snack);
    snack.$element.css({left: snack.position[0] * gridSize, top: snack.position[1] * gridSize});
    $main.append(snack.$element);
  }

  function findSnackSpace() {

    var x = Math.round(Math.random() * (gridWidth - 1));
    var y = Math.round(Math.random() * (gridHeight -1));
    var found = [x,y];

    snake.forEach(function checkSegment(segment) { //TODO: use breakable jQuery loop
      if (segment.position[0] === x && segment.position[1] === y) {
        found = false;
      }
    });

    if (!found) return found; // IKEA shortcut

    snacks.forEach(function cjackSnack(snack) {
      if (snack.position[0] === x && snack.position[1] === y) {
        found = false;
      }
    });

    return found;
  }

  function checkSnack(headPosition) {
    snacks.forEach(function check(snack, index) {
      if (snack.position[0] === headPosition[0] && snack.position[1] === headPosition[1]) {
        eatSnack(index)
      }
    });
  }

  function eatSnack(index) {
    snacks[index].$element.remove();
    snacks.splice(index, 1);

    score++;
    $score.html(score);
    growStack += SNACK_SIZE;
    placeSnack();
  }


  function addControlHandlers() {
    $(window).keydown(function (event) {
      switch (event.which) {
        case 37: // left
          if (currentControlDirection !== 'right') {
            nextControlDirection = 'left';
          }
          break;
        case 38: // up
          if (currentControlDirection !== 'down') {
            nextControlDirection = 'up';
          }
          break;
        case 39: // right
          if (currentControlDirection !== 'left') {
            nextControlDirection = 'right';
          }
          break;
        case 40: // down
          if (currentControlDirection !== 'up') {
            nextControlDirection = 'down';
          }
          break;
        default:
          return; // exit this handler for other keys
      }
      event.preventDefault(); // prevent the default action (scroll / move caret)
    });
  }

  return {
    start: startGame
  }

})(jQuery);
