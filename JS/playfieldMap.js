
export const playfieldMap= {
  tunnels: [
    {
      color: 'green',
      portals: [
        {x: 60, y: 60},
        {x: 100, y: 100}
      ],
      geometry: [
        [70, 70], [70, 110], [110, 110]
      ]
    },
    {
      color: 'red',
      portals: [
        {x: 20, y: 20},
        {x: 280, y: 20},
        {x: 280, y: 140 }
      ],
      geometry: [
        [30, 30], [290, 30], [290, 150]
      ]
    },
    {
      color: 'blue',
      portals: [
        { x: 120, y: 50 },
        { x: 220, y: 50 },
        { x: 170, y: 90 }
      ],
      geometry: [
        [130, 60], [180, 60], [180, 100], [230, 100], [230, 60]
      ]
    }
  ]
}
