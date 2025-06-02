import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// スケジュール取得API
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    let whereClause = {};
    if (date) {
      const targetDate = new Date(date);
      const nextDate = new Date(targetDate);
      nextDate.setDate(targetDate.getDate() + 1);

      whereClause = {
        startTime: {
          gte: targetDate,
          lt: nextDate,
        },
      };
    }

    const schedules = await prisma.schedule.findMany({
      where: whereClause,
      orderBy: {
        startTime: 'asc',
      },
    });

    return NextResponse.json(schedules);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedules' },
      { status: 500 }
    );
  }
}

// スケジュール作成API
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, startTime, endTime } = body;

    // 現在の日付を取得
    const today = new Date();
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);

    // 開始時刻と終了時刻のDateオブジェクトを作成
    const startDateTime = new Date(today);
    startDateTime.setHours(startHours, startMinutes, 0, 0);

    const endDateTime = new Date(today);
    endDateTime.setHours(endHours, endMinutes, 0, 0);

    const schedule = await prisma.schedule.create({
      data: {
        title,
        startTime: startDateTime,
        endTime: endDateTime,
      },
    });

    return NextResponse.json(schedule);
  } catch (error) {
    console.error('Error creating schedule:', error);
    return NextResponse.json(
      { error: 'Failed to create schedule' },
      { status: 500 }
    );
  }
} 