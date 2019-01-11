const fs = require('fs')
const readline = require('readline')

const endpoints = []

const readMaze = async () => {
  const maze = []

  const filename = process.argv[2]
  const fileStream = fs.createReadStream(filename)

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  })

  for await (const line of rl) {
    maze.push(line)
  }

  return maze
}

const addBorder = (maze) => {
  // const height = maze.length
  const width = maze[0].length

  const mazeWithBorder = []

  mazeWithBorder.push('.'.repeat(width + 2))
  for (let i of maze) {
    mazeWithBorder.push(`.${i}.`)
  }
  mazeWithBorder.push('.'.repeat(width + 2))

  return mazeWithBorder
}

const go = (path, direction = 'up') => {
  const lastPosition = path[path.length - 1]
  const newPosition = {
    i: 0,
    j: 0,
  }

  switch (direction) {
    case 'up':
      newPosition.i = lastPosition.i - 1
      newPosition.j = lastPosition.j
      break
    case 'down':
      newPosition.i = lastPosition.i + 1
      newPosition.j = lastPosition.j
      break
    case 'right':
      newPosition.i = lastPosition.i
      newPosition.j = lastPosition.j + 1
      break
    case 'left':
      newPosition.i = lastPosition.i
      newPosition.j = lastPosition.j - 1
      break
    default:
      break
  }

  path.push(newPosition)
}

const hasAlreadyVisited = (path) => {
  const tmp = Array.from(path)

  const lastPosition = tmp.pop()

  return tmp.some(position => position.i === lastPosition.i && position.j === lastPosition.j)
}

const explore = (maze, path = [], currentDirection = 'down') => {
  if (path.length === 0) {
    path.push({
      i: 1,
      j: 1,
    })
  }

  let keepExploring = true

  while (keepExploring) {
    const lastPosition = path[path.length - 1]

    switch (maze[lastPosition.i][lastPosition.j]) {
      case '^':
        currentDirection = 'up'
        if (hasAlreadyVisited(path)) {
          keepExploring = false
        } else {
          go(path, currentDirection)
        }
        break
      case 'v':
        currentDirection = 'down'
        if (hasAlreadyVisited(path)) {
          keepExploring = false
        } else {
          go(path, currentDirection)
        }
        break
      case '>':
        currentDirection = 'right'
        if (hasAlreadyVisited(path)) {
          keepExploring = false
        } else {
          go(path, currentDirection)
        }
        break
      case '<':
        currentDirection = 'left'
        if (hasAlreadyVisited(path)) {
          keepExploring = false
        } else {
          go(path, currentDirection)
        }
        break
      case ' ': // keep going the same previous direction
        go(path, currentDirection)
        break
      case '|': // fork
        if (!hasAlreadyVisited(path)) {
          const path1 = Array.from(path)
          const path2 = Array.from(path)
          go(path1, 'up')
          go(path2, 'down')
          explore(maze, path1, 'up')
          explore(maze, path2, 'down')
        }
        keepExploring = false
        break
      case '-': // fork
        if (!hasAlreadyVisited(path)) {
          const path1 = Array.from(path)
          const path2 = Array.from(path)
          go(path1, 'right')
          go(path2, 'left')
          explore(maze, path1, 'right')
          explore(maze, path2, 'left')
        }
        keepExploring = false
        break
      case '?': // fork
        if (!hasAlreadyVisited(path)) {
          const path1 = Array.from(path)
          const path2 = Array.from(path)
          const path3 = Array.from(path)
          const path4 = Array.from(path)
          go(path1, 'up')
          go(path2, 'down')
          go(path3, 'right')
          go(path4, 'left')
          explore(maze, path1, 'up')
          explore(maze, path2, 'down')
          explore(maze, path3, 'right')
          explore(maze, path4, 'left')
        }
        keepExploring = false
        break
      case '.':
        const endPosition = path.pop()
        if (!endpoints.some(e => e.i === endPosition.i && e.j === endPosition.j)) {
          endpoints.push(endPosition)
        }
        keepExploring = false
        break
    }
  }
}

const main = async () => {
  if (!process.argv[2]) {
    console.log('usage: node index.js <maze file>')
    console.log('       ^')
    console.log('       node v11.6.0 at least')
    return
  }

  const inputMaze = await readMaze()

  const maze = addBorder(inputMaze)
  for (let i of maze) {
    console.log(i)
  }

  explore(maze)

  console.log(endpoints.length)
}

main() // entry point
