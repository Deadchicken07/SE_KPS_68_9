'use client'

export type Appointment = {
    id : number 
    user_id : number 
    staff_id : number 
    appointment_type : 'online' | 'onsite'
    appointment_date : string
    status : 'paying' | 'not paying'
    time_select : string
    deposite_slip_file : string | null
}

export const mockAppointments: Appointment[] = [
    {
        id: 1,
        user_id: 101,
        staff_id: 5,
        appointment_type: 'online',
        appointment_date: '2026-03-15T09:00:00.000Z',
        status: 'paying',
        time_select: '09:00',
        deposite_slip_file: null,
    },
    {
        id: 2,
        user_id: 102,
        staff_id: 5,
        appointment_type: 'onsite',
        appointment_date: '2026-03-16T10:30:00.000Z',
        status: 'not paying',
        time_select: '10:30',
        deposite_slip_file: 'slip_102.png',
    },
    {
        id: 3,
        user_id: 103,
        staff_id: 7,
        appointment_type: 'online',
        appointment_date: '2026-03-17T13:00:00.000Z',
        status: 'paying',
        time_select: '13:00',
        deposite_slip_file: 'slip_103.png',
    },
]
