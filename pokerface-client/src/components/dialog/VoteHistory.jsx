import React, { useState } from 'react'
import { useMediaQuery } from '@mui/material'
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  IconButton,
  Typography,
} from '@mui/material'
import muiStyles from '../../style/muiStyles'
const { CloseIcon, Box } = muiStyles

const VoteHistory = ({ showDialog, setShowDialog, gameData }) => {
  // const isSmallScreen = useMediaQuery('(max-width: 600px)')

  // const headerCellStyle = (minWidth) => {
  //   return {
  //     backgroundColor: '#f2f2f2',
  //     padding: '5px 10px',
  //     fontSize: '16px',
  //     fontWeight: 'bold',
  //     minWidth: `${minWidth}px`,
  //   }
  // }
  // const rowCellStyle = (minWidth) => {
  //   return {
  //     padding: '5px 10px',
  //     fontSize: '16px',
  //     minWidth: `${minWidth}px`,
  //   }
  // }

  // const mappedVoteRows = gameData.voteHistory.map((voting, index) => {
  //   // console.log(voting)
  //   return (
  //     <TableRow
  //       key={index}
  //       sx={index % 2 !== 0 ? { borderBottom: '1px solid grey' } : {}}
  //     >
  //       <TableCell sx={rowCellStyle}>{}</TableCell>
  //       <TableCell sx={rowCellStyle}>{}</TableCell>
  //       <TableCell sx={rowCellStyle}>{}</TableCell>
  //       <TableCell sx={rowCellStyle}>{}</TableCell>
  //       <TableCell sx={rowCellStyle}>{}</TableCell>
  //       <TableCell sx={rowCellStyle}>{}</TableCell>
  //     </TableRow>
  //   )
  // })

  // return (
  //   <Dialog
  //     onClose={() => setShowDialog(!showDialog)}
  //     fullScreen={isSmallScreen}
  //     PaperProps={{
  //       style: {
  //         borderRadius: !isSmallScreen && 15,
  //         display: 'flex',
  //         flexDirection: 'column',
  //         justifyContent: 'center',
  //         gap: 20,
  //         maxWidth: '100vw',
  //         padding: 55,
  //       },
  //     }}
  //     open={showDialog}
  //   >
  //     <IconButton
  //       sx={{ position: 'absolute', top: 7, right: 5 }}
  //       aria-label="close"
  //       onClick={() => setShowDialog(!showDialog)}
  //     >
  //       <CloseIcon />
  //     </IconButton>
  //     <Typography variant="h5">Vote History</Typography>

  //     <Box sx={{ overflowX: 'scroll' }}>
  //       <Table>
  //         <TableHead>
  //           <TableRow>
  //             <TableCell sx={headerCellStyle(140)}>Matter at hand</TableCell>
  //             <TableCell sx={headerCellStyle(90)}>Average</TableCell>
  //             <TableCell sx={headerCellStyle(100)}>Agreement</TableCell>
  //             <TableCell sx={headerCellStyle(100)}>Vote Time</TableCell>
  //             <TableCell sx={headerCellStyle(120)}>Voted / total</TableCell>
  //             <TableCell sx={headerCellStyle(150)}>Player Results</TableCell>
  //           </TableRow>
  //         </TableHead>
  //         <TableBody>{mappedVoteRows}</TableBody>
  //       </Table>
  //     </Box>
  //   </Dialog>
  // )
}

export default VoteHistory
