var app = {};

var go = function()
{
    wi.clear_console();

    //
    app = function create_app()
    {
        //
        var states = [ "null", "Edit", "Ready", "Presentation" ];
        var transition = {};
        var currentState = "null";
        var noTrans = function() { return false; };
        var numRows = 4;
        var numColumns = 35;
        var numCharacters = numRows*numColumns;
        var charset = " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~«»É•àâçèéêëîïôõö÷øùúûüäÄËÏÖÜß"
        var characters = [];
        var message = "";
        var cursorRow = 0;
        var cursorColumn = 0;
        var cursorBlinkPeriod = 530;
        var onKeyUp = function(event) { if (currentState == "Edit") onKeyUpTextArea(event); };
        var onKeyDown = function(event) { if (currentState == "Edit") onKeyDownTextArea(event); };
        var onBlur = function() { if (currentState == "Edit") { var self = this; setTimeout(function() { self.focus(); }, 50); } };
        var introInterval = 0;

        //
        var pos = function(row, column)
        {
            return row*numColumns+column;
        };

        var cursorPos = pos(cursorRow, cursorColumn);
        var lastPos = pos(numRows-1, numColumns-1);
        var cursorInterval = undefined;
        var keyDown = false;
        var insertMode = true;
        var i=0;

        //
        for (i=0; i<states.length; i++)
        {
            transition[states[i]] = {};
            for (var j=0; j<states.length; j++)
                transition[states[i]][states[j]] = noTrans;
        }

        for (i=0; i<numCharacters; i++)
            characters.push(" ");

        //
        var enableDialog = function(idDialog, enable)
        {
            wi.enableElementTree(wi.elem(idDialog), enable, true);
        };

        //
        var buildTable = function(prefix, cellClasses)
        {
            var rows = [];
            var row=0;
            var topCells = undefined;

            var createColumns = function(row)
            {
                var columns = [];
                var col=0;

                for (col=0; col<numColumns; col++)
                    columns.push(
                        wi.createElement(
                            "div",
                            {
                                id: prefix + pos(row,col),
                                className: cellClasses
                            }
                            )
                        );

                return columns;
            };

            for (row=0; row<numRows; row++)
                rows.push(
                    wi.createElement(
                        "div",
                        {
                            className: "messageRow"
                        },
                        createColumns(row)
                        )
                    );

            topCells = rows[0].children;

            for (col=0; col<numColumns; col++)
                wi.addClass(topCells[col], "topCell");

            for (row=0; row<numRows; row++)
                wi.addClass(rows[row].firstChild, "leftCell");

            return rows;
        };

        //
        var messageDOM = function()
        {
            return wi.createElement(
                "div",
                {
                    id: "idMessageDialog",
                    className: "topLevelDiv"
                },
                [
                    [
                        "div",
                        {
                            id: "idMessageDisplay",
                            className: "messageTable"
                        },
                        buildTable("c", " messageCell glyphCell")
                    ]
                ]
                );
        };

        //
        var editableMessageDOM = function()
        {
            var messageElement = messageDOM();

            messageElement.appendChild(
                wi.createElement(
                    "textarea",
                    {
                        id: "idMessageTextArea",
                        onkeydown: onKeyDown,
                        onkeyup: onKeyUp ,
                        onblur: onBlur,
                    }
                    )
                );

            messageElement.appendChild(
                wi.createElement(
                    "div",
                    {
                        id: "idMessageOverlay",
                        className: "messageTable overlayTable"
                    },
                    function()
                    {
                        var table = buildTable("o", "messageCell overlayCell");
                        wi.forEach(
                            table,
                            function(row,rowIndex){
                                wi.forEach(
                                    row.children,
                                    function(cell,columnIndex) {
                                        cell.appendChild(
                                            wi.createElement(
                                                "div",
                                                {
                                                    className: "underscoreCursor"
                                                }
                                                )
                                            );
                                        cell.onclick = function(event) { if (currentState == "Edit") putCursor(rowIndex,columnIndex); };
                                        }
                                    )
                                }
                            );
                        return table;
                    }()
                    )
                );
            return messageElement;
        };

        //
        var editDOM = function()
        {
            return wi.createElement(
                "div",
                {
                    id: "idEdit",
                    className: "topLevelDiv",
                },
                [
                    [
                        "div",
                        {
                            className: "paddingTop paddingBottom",
                            innerHTML: "Na het SMSje is er nu ook het <em>NMBSje</em>."
                        }
                    ],
                    [
                        "div",
                        {
                            className: "paddingBottom",
                            innerHTML: "Schrijf hier uw boodschap:"
                        }
                    ],
                    editableMessageDOM(),
                    [
                        "div",
                        {
                            id: "idReadyButtonDiv",
                            className: "paddingTop paddingBottom"
                        },
                        [
                            wi.styledButton(
                                "idReadyButton", "Klaar", function(){ gotoState("Ready"); }, true, "customButton"
                                )
                        ]
                    ]
                ]
                );
        };

        //
        var presentationDOM = function()
        {
            return wi.createElement(
                "div",
                {
                    id: "idPresentation",
                    className: "topLevelDiv",
                },
                [
                    messageDOM(),
                    [
                        "div",
                        {
                            id: "idEditButtonDiv",
                            className: "paddingTop paddingBottom"
                        },
                        [
                            "a",
                            {
                                className : "iconButton",
                                href: location.href.split("?")[0],
//                                onclick: function(){ gotoState("Edit");  }
                            },
                            [
                                "img",
                                {
                                    src: "edit27.svg"
                                }
                            ]
                        ]
                    ]
                ]
                );
        };

        //
        var onCloseDialog = function(idDialog)
        {
            switch (idDialog)
            {
                case "idReady":
                    gotoState("Edit");
                    break;
            }
        };

        //
        var closeButtonDOM = function(idDialog)
        {
            return wi.styledButton(
                    idDialog + "Close", "&times;",
                    function(){onCloseDialog(idDialog); return false;},
                    true,
                    "closeButton"
                    );
        };

        //
        var readyDOM = function()
        {
            return wi.createElement(
                "div",
                {
                    id: "idReady",
                    className: "readyDiv",
                },
                [
                    closeButtonDOM("idReady"),
                    [
                        "div",
                        {
                            className: "centeredText",
                            innerHTML: "Uw bericht staat:"
                        }
                    ],
                    function()
                    {
                        var button = wi.styledButton("idLinkButton", "Hier", function(){ return true; }, true, "customButton");
                        button.firstChild.href = baseURL(trimTrailingHash(location.href)) + "?m=" + LZString.compressToURIsafe64(characters.join(""));
                        return button;
                    }(),
                    [
                        "div",
                        {
                            className: "centeredText",
                            innerHTML: "Klik op de link om naar uw bericht te gaan, of klik erop met de rechtermuisknop en kopieer de link om het bericht te delen met anderen."
                        }
                    ]
                ]
                );
        };

        //
        var isRowEmpty = function(row, from)
        {
            var i=0;

            if ( (row<0) || (row>=numRows) )
                return false;

            if (from == undefined)
                from = 0;

            for (i=pos(row,from); i<pos(row+1,0); i++)
                if (characters[i] != " ")
                    return false;

            return true;
        };

        //
        var moveRange = function(srcFirst, srcLast, offset)
        {
            var dest, src;

            src =  (offset<0) ? srcFirst : srcLast;
            dest = src + offset;

            if ( badPos(srcFirst) || badPos(srcLast) || badPos(dest) )
                return;

            if (offset<0)
                while (src<=srcLast)
                {
                    setCharacter(characters[src], dest++);
                    setCharacter(" ", src++);
                }
            else
                while (src>=srcFirst)
                {
                    setCharacter(characters[src], dest--);
                    setCharacter(" ", src--);
                }
        };

        //
        var trailingEmpty = function(row)
        {
            var emptyColumn = numColumns;

            if ((row<0) || (row>=numRows))
                return numColumns-1;

            while (emptyColumn>=0)
                if (characters[pos(row,--emptyColumn)] != " ")
                    break;

            return emptyColumn+1;
        };

        //
        var row = function(pos)
        {
            return Math.floor(pos/numColumns);
        };

        //
        var badPos = function(pos)
        {
            return ((pos<0) || (pos>=numCharacters))
        };

        //
        var findCharPosition = function(buffer,c)
        {
            var idx = buffer.indexOf(c);
            /* SIZE */
//            var xPos = 1 + idx*10;
            /* SIZE */
            var xPos = 1 + idx*20;
            if (idx<0)
                wi.error("Character '" + c + "' not found in charset");
            return "-" + xPos + "px 0";
        };

        //
        var setCharacter = function(c,i)
        {
            characters[i] = c;
            wi.elem("c"+i).style.backgroundPosition = findCharPosition(charset,c);
        };

        //
        var readParameter = function()
        {
            var encodedMessage = wi.getURLParamValue("m");

            if (encodedMessage.length==0)
                return false;

            message = LZString.decompressFromURIsafe64(encodedMessage);

            if ( (!message) || (message.length!=numCharacters) )
            {
                location.replace(location.href.split("?")[0]);
                return false;
            }

            return true;
        };

        //
        var trimTrailingHash = function(s)
        {
            while (s[s.length-1] == "#")
                s = s.slice(0,-1);

            return s;
        };

        //
        var baseURL = function(s)
        {
            return s.split("?")[0];
        };

        //
        var putCursor = function(row,col)
        {
            if ( (row<0) || ( (row>=numRows-1) && (col>=numColumns) ) || ( (row<=0) && (col<0) ) || (row>=numRows) )
                return;

            if (col>=numColumns)
            {
                col = 0;
                row += 1;
            }

            if (col<0)
            {
                col = numColumns-1;
                row -=1;
            }

            clearInterval(cursorInterval);
            hideCursor();
            cursorRow = row;
            cursorColumn = col;
            cursorPos = pos(row,col);
            showCursor();
            cursorInterval = setInterval(toggleCursor, cursorBlinkPeriod);
        };

        //
        var showCursor = function()
        {
            var overlayCell = wi.elem("o" + pos(cursorRow,cursorColumn));
            var cursorElem = insertMode ? overlayCell.firstChild : overlayCell;
            wi.addClass(cursorElem, "showCursor");
        };

        //
        var hideCursor = function()
        {
            var overlayCell = wi.elem("o" + pos(cursorRow,cursorColumn));
            var cursorElem = insertMode ? overlayCell.firstChild : overlayCell;
            wi.removeClass(cursorElem, "showCursor");
        };

        //
        var cursorVisible = function()
        {
            var overlayCell = wi.elem("o" + pos(cursorRow,cursorColumn));
            var cursorElem = insertMode ? overlayCell.firstChild : overlayCell;
            return wi.hasClass(cursorElem, "showCursor");
        };

        //
        var toggleCursor = function()
        {
            if (cursorVisible())
                hideCursor();
            else
                showCursor();
        };

        //
        var toggleInsertMode = function()
        {
            clearInterval(cursorInterval);

            hideCursor();
            insertMode = !insertMode;
            showCursor();

            cursorInterval = setInterval(toggleCursor, cursorBlinkPeriod);
        };

        //
        var onKeyDownTextArea = function(event)
        {
            var charCode = wi.getKeyCode(event);
            if (charCode == 9)
            {
                event.stopPropagation();
                event.preventDefault();
            }

            if ( (!keyDown) && (charCode == 45) )
                toggleInsertMode();

            if (keyDown)
                processKeyEvent(charCode);
            keyDown = true;
        };

        //
        var onKeyUpTextArea = function(event)
        {
            keyDown = false;
            processKeyEvent(wi.getKeyCode(event));
        };

        //
        var processCharsI = function(chars)
        {
            wi.forEach(
                chars,
                function(c) {
                    if (charset.indexOf(c)>=0)
//                        if (characters[numRows*numColumns-1]==" ")
                        if (characters[lastPos]==" ")
                        {
                            moveRange(cursorPos, pos(numRows-1, numColumns-2), 1);
                            setCharacter(c,cursorPos);
                            if ((cursorRow>=numRows-1) && (cursorColumn>=numColumns-1))
                                return true;
                            putCursor(cursorRow, cursorColumn+1);
                        }
                },
                true
               );
        };

        //
        var processCharsO = function(chars)
        {
            wi.forEach(
                chars,
                function(c) {
                    if (charset.indexOf(c)>=0)
                    {
                        setCharacter(c,cursorPos);
                        if ((cursorRow>=numRows-1) && (cursorColumn>=numColumns-1))
                            return true;
                        putCursor(cursorRow, cursorColumn+1);
                    }
                },
                true
               );
        };

        //
        var processKeyEvent = function(charCode )
        {
            var textArea= wi.elem("idMessageTextArea");

            switch (charCode)
            {
                // end
                case 35:
                    putCursor(cursorRow, numColumns-1);
                    break;

                // home
                case 36:
                    putCursor(cursorRow, 0);
                    break;

                // arrow left
                case 37:
                    putCursor(cursorRow, cursorColumn-1);
                    break;

                // arrow up
                case 38:
                    putCursor(cursorRow-1, cursorColumn);
                    break;

                // arrow right
                case 39:
                    putCursor(cursorRow, cursorColumn+1);
                    break;

                // arrow down
                case 40:
                    putCursor(cursorRow+1, cursorColumn);
                    break;

                // del
                case 46:
                    if (isRowEmpty(cursorRow, cursorColumn))
                    {
                        moveRange(pos(cursorRow+1,0), pos(cursorRow+1, numColumns-1), cursorColumn-numColumns);
                        if (isRowEmpty(cursorRow+1))
                            moveRange(pos(cursorRow+2,0), lastPos, -numColumns);
                    }
                    else
                        if (cursorPos!=lastPos)
                            moveRange(cursorPos+1, lastPos, -1);
                        else
                            setCharacter(" ", lastPos);
                    break;

                // backspace
                case 8:
                    if (cursorColumn>0)
                    {
                        moveRange(cursorPos, lastPos, -1);
                        putCursor(cursorRow, cursorColumn-1);
                    }
                    else
                        if (cursorRow>0)
                        {
                            var destColumn = trailingEmpty(cursorRow-1);
                            destColumn = (destColumn>=numColumns) ? numColumns-1 : destColumn;
                            wi.log("destColumn == "+ destColumn);
                            moveRange(cursorPos, pos(cursorRow, numColumns-1), destColumn-numColumns);
                            if (isRowEmpty(cursorRow))
                                moveRange(pos(cursorRow+1,0), lastPos, -numColumns);
                            putCursor(cursorRow-1, destColumn);
                        }
                    break;

                // enter
                case 13:
                    if (isRowEmpty(numRows-1, 0))
                    {
                        moveRange(pos(cursorRow+1, 0), pos(numRows-2, numColumns-1), numColumns);
                        moveRange(cursorPos, pos(cursorRow, numColumns-1), pos(cursorRow+1, 0)-cursorPos);
                    }
                    putCursor(cursorRow+1,0);
                    break;

                //
                default:
                    if (insertMode)
                        processCharsI(textArea.value);
                    else
                        processCharsO(textArea.value);
                    break;
            }

            textArea.value = "";
        };

        //
        var displayMessage = function()
        {
            var stack = function()
            {
                var currentColumn = 0;
                var columnPos =numColumns-1;
                var row=0;

                var step = function()
                {
                    if (currentColumn==numColumns)
                    {
                        clearInterval(introInterval);
                        return;
                    }

                    for (row=0; row<numRows; row++)
                        setCharacter(message[pos(row, currentColumn)], pos(row, columnPos));

                    if (columnPos<numColumns-1)
                        for (row=0; row<numRows; row++)
                            setCharacter(" ", pos(row, columnPos+1));

                    if (columnPos==currentColumn)
                    {
                        currentColumn++;
                        columnPos = numColumns-1;
                    }
                    else
                        columnPos--;
                };

                return {
                    step : step
                };
            }();

            var randomize = function()
            {
                var shuffledNumbers = function(n)
                {
                    var array = [], i,j;

                    for (i=0; i<=n-1; i++)
                    {
                        j = wi.getRandom(0,i);
                        if (j!=i)
                            array.push(array[j]);
                        array[j]=i;
                    }

                    return array;
                };

                var randomPositions = shuffledNumbers(numCharacters);
                var currentPosition = 0;

                var step = function()
                {
                    if (currentPosition==numCharacters)
                    {
                        clearInterval(introInterval);
                        return;
                    }

                    setCharacter(message[randomPositions[currentPosition]], randomPositions[currentPosition]);
                    currentPosition++;
                };

                return {
                    step : step
                };
            }();

            var interleave = function()
            {
                var count = 0;

                var step = function()
                {
                    if (count==numColumns)
                    {
                        clearInterval(introInterval);
                        return;
                    }

                    if (count>0)
                    {
                        moveRange(pos(0,0), pos(0,count-1),1);
                        moveRange(pos(2,0), pos(2,count-1),1);
                        moveRange(pos(1,numColumns-count), pos(1,numColumns-1),-1);
                        moveRange(pos(3,numColumns-count), pos(3,numColumns-1),-1);
                    }

                    setCharacter(message[pos(0,numColumns-count-1)],pos(0,0));
                    setCharacter(message[pos(2,numColumns-count-1)],pos(2,0));
                    setCharacter(message[pos(1,count)],pos(1,numColumns-1));
                    setCharacter(message[pos(3,count)],pos(3,numColumns-1));

                    count++;
                };

                return {
                    step : step
                };
            }();

            var intros = [
                {
                    intro: stack,
                    timeout : 1
                },
                {
                    intro: randomize,
                    timeout : 6
                },
                {
                    intro: interleave,
                    timeout : 30
                }
                ];

//            var randomIntro = intros[2];
            var randomIntro = intros[wi.getRandom(0,intros.length-1)];
            introInterval = setInterval(randomIntro.intro.step, randomIntro.timeout);
        }

        //
        var gotoState = function(newState)
        {
            if (transition[currentState][newState]())
            {
                wi.info("Transition from '" + currentState + "' to '" + newState + "'.");
                currentState = newState;
            }
            else
                wi.warn("Transition from '" + currentState + "' to '" + newState + "' not allowed.");
        };

        //
        transition["null"]["Edit"] = function()
        {
            wi.body().appendChild(editDOM());
            putCursor(0,0);
            wi.elem("idMessageTextArea").focus();
            return true;
        };

        //
        transition["Edit"]["Ready"] = function()
        {
            clearInterval(cursorInterval);
            hideCursor();
            wi.enableElementTree(wi.elem("idReadyButton"), false);
            wi.body().appendChild(readyDOM());
            return true;
        };

        //
        transition["Ready"]["Edit"] = function()
        {
            wi.deleteElementById("idReady");
            wi.enableElementTree(wi.elem("idReadyButton"), true);
            showCursor();
            cursorInterval = setInterval(toggleCursor, cursorBlinkPeriod);
            wi.elem("idMessageTextArea").focus();
            return true;
        };

        //
        transition["null"]["Presentation"] = function()
        {
            wi.body().appendChild(presentationDOM());
            displayMessage();
            return true;
        };

        //
        return {
            gotoState : gotoState,
            readParameter: readParameter
        };

    }();

    if (app)
        if (app.readParameter())
            app.gotoState("Presentation");
        else
            app.gotoState("Edit");

//    var a = function(n){
//        var array = [];
//        var i=0;
//        for (i=0; i<n; i++)
//            array.push(i);
//        return array;
//    }(8);
//
//
//    //
//    var shuffle = function(array)
//    {
//          var currentIndex = array.length, temporaryValue, randomIndex ;
//
//          // While there remain elements to shuffle...
//          while (0 !== currentIndex)
//          {
//              // Pick a remaining element...
//              randomIndex = Math.floor(Math.random() * currentIndex);
//              currentIndex -= 1;
//
//              // And swap it with the current element.
//              temporaryValue = array[currentIndex];
//              array[currentIndex] = array[randomIndex];
//              array[randomIndex] = temporaryValue;
//          }
//
//          return array;
//    }


};
